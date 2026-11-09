# -*- coding: utf-8 -*-
"""GitPulse 机械采集/拼接工具（RUNBOOK §1.0 机械聚合口径）。
只做机械计数与原始输出留痕；全部判定、评分与定性结论由分析会话作出。
子命令：
  collect <project> <rundir>   采集一个项目 → <rundir>/_evidence/agg.json + raw/
  extractprev <project> <oldrundir> <rundir>  从上期 index.html 提取 REPORT_DATA → <rundir>/_evidence/prev_report_data.json
  splice <project> <rundir> <data.json>      用模板生成自包含 index.html
只读 git（log/show/rev-list/merge-base/ls-files/ls-tree/grep）；不执行任何写操作于目标仓库。
"""
import subprocess, json, os, re, sys, datetime, io, html
from urllib.parse import quote as _urlquote

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
TODAY = datetime.date(2026, 11, 8)
RUN_AT = "2026-11-08 20:00"   # 本期运行时刻（采集锚点，全项目一致）
WINDOW_START = datetime.date(2026, 11, 1)  # AddDays(-7)，含首尾至 11-08

# 项目配置镜像 config/monitor.yaml（只读快照；stats_start 取自各项目上期 meta/上下文登记口径）
PROJECTS = {
 "ip-integration": {"stats_start": "2026-09-30", "base": ".projects/ip-integration", "repos": [
   ("ipiapp", ["master", "buaa"], "master", None),
   ("ourchem-integration-platform", ["master", "beihang_dev", "v2.11.15"], "master", None),
   ("ourchem-bpm", ["master"], "master", None),
   ("ourchem-data-server", ["master-pro", "local"], "master-pro", None),
   ("answer", ["master"], "master", None)]},
 "ai-patent": {"stats_start": "2026-09-30", "base": ".projects/ai-patent", "repos": [
   ("tanbaoai-web", ["master", "1027gq"], "master", None),
   ("ourchem-ai-patent", ["dev", "1.7.0-guangqi", "1.8.5-release"], "dev", None),
   ("ai-patent-prompt", ["master", "demo"], "master", None)]},
 "patyee": {"stats_start": "2026-08-01", "base": ".projects/patyee", "repos": [
   ("patyee-next", ["master", "图像检索优化-支持多张图片同时检索", "1016188-登录释放策略优化", "feat-1016010-收藏夹支持检索", "feat-1016189-专利分析-技术生命周期优化"], "master", None),
   ("ourchem-patyee", ["master-pro", "v5.13.8", "feat-1016010-收藏夹支持检索"], "master-pro", None),
   ("ourchem-data", ["master-pro", "v5.14.0", "feat-1016010-收藏夹支持检索", "feat-1016189-专利分析技术生命周期优化"], "master-pro", None),
   ("ourchem-middle-service", ["master-pro", "feat-1016188-登录释放策略优化"], "master-pro", None),
   ("ourchem-oauth", ["master-pro", "v5.17-1016188-登录释放策略优化"], "master-pro", None),
   ("lucene", ["master", "v4.2.0"], "master", None),
   ("image-search-v2", ["master"], "master", None),
   ("image-search-process-v2", ["master"], "master", None)]},
 "public-service": {"stats_start": "2026-09-30", "base": ".projects/public-service", "repos": [
   ("wx-public-service-platform", ["master", "knowledge_online_dm_jl", "nuaa_integrated", "gzkfq_service_platform"], "master", None),
   ("ip-online", ["master"], "master", None),
   ("nuaa-ip-transformation-platform", ["master"], "master", None),
   ("cms", ["master"], "master", None)]},
 "pat-crosssem": {"stats_start": "2026-08-01", "base": ".projects/pat-crosssem", "repos": [
   ("pat-crosssem", ["master", "backup/pre-rollback-2ea165f", "feature/alpha", "feature/init", "feature/onboarding"], "master", "origin/feature/alpha"),
   ("pat-crosssem-2", ["master", "feature/shhz", "feature/shhz-novelty-eval", "patent_citation_collect", "shz", "shz_new_logic"], "master", "origin/feature/shhz-novelty-eval"),
   ("pat-crosssem-gt", ["master"], "master", "origin/master"),
   ("pat-crosssem-probe-data", ["master", "feature/alpha", "feature/shaohongzhi"], "master", "origin/feature/shaohongzhi")]},
 "order-system": {"stats_start": "2026-10-02", "base": ".projects/_non-pulse/order-system", "repos": [
   ("order-core", ["main", "develop", "feature-payment"], "main", None)]},
}
# pat-crosssem 成员别名（state/context/pat-crosssem.md B 类登记：同一成员多 git 身份）
ALIASES = {
 "pat-crosssem": [
   (lambda n, e: (e and "chenjiaming" in e) or n in ("25311753", "陈嘉明"), "陈嘉明"),
   (lambda n, e: (e and "shao_shz" in e) or "shaohongzhi" in (n or ""), "邵宏志")],
}

def git(repo, *args):
    r = subprocess.run(["git", "-c", "core.quotepath=false"] + list(args), cwd=repo,
                       capture_output=True, timeout=600)
    return r.returncode, r.stdout.decode("utf-8", "replace"), r.stderr.decode("utf-8", "replace")

def parse_iso(s):
    s = s.strip()
    try:
        return datetime.datetime.strptime(s, "%Y-%m-%d %H:%M:%S %z")
    except ValueError:
        try:
            return datetime.datetime.strptime(s[:19], "%Y-%m-%d %H:%M:%S").replace(tzinfo=datetime.timezone(datetime.timedelta(hours=8)))
        except ValueError:
            return None

def pkey(name, email):
    for pred, canon in ALIASES.get(CUR_PROJ, []):
        if pred(name, email):
            return canon
    return email if email else "name:" + (name or "unknown")
CUR_PROJ = None

TEST_PAT = re.compile(r"(^|/)(test|tests|__tests__|src/test|e2e)(/|$)|(^|/)(test_[^/]*|[^/]*_test\.[^/]*|[^/]*\.test\.[^/]*|[^/]*\.spec\.[^/]*|[^/]*Test\.java|[^/]*Tests\.java|[^/]*IT\.java)$")

def is_merge(parents): return " " in parents.strip()
def cls_of(subject):
    m = re.match(r"^\s*(feat|fix|refactor|docs|test|chore|style|perf|build|ci|revert)\b(.*)", subject, re.I)
    if m: return m.group(1).lower()
    return "其他"

def count_lines_working(repo, rel):
    p = os.path.join(repo, rel)
    try:
        with open(p, "rb") as f:
            data = f.read()
        if b"\x00" in data[:8000]:
            return None
        txt = data.decode("utf-8", "replace")
        return sum(1 for ln in txt.splitlines() if ln.strip())
    except OSError:
        return None

def collect(proj, rundir):
    global CUR_PROJ
    CUR_PROJ = proj
    cfg = PROJECTS[proj]
    stats_start = datetime.datetime.strptime(cfg["stats_start"], "%Y-%m-%d").replace(tzinfo=datetime.timezone(datetime.timedelta(hours=8)))
    trav_start = (stats_start - datetime.timedelta(days=60)).strftime("%Y-%m-%d 00:00")
    win_start = datetime.datetime.combine(WINDOW_START, datetime.time(0, 0), tzinfo=datetime.timezone(datetime.timedelta(hours=8)))
    today0 = datetime.datetime.combine(TODAY, datetime.time(0, 0), tzinfo=datetime.timezone(datetime.timedelta(hours=8)))
    evdir = os.path.join(rundir, "_evidence"); rawdir = os.path.join(evdir, "raw")
    os.makedirs(rawdir, exist_ok=True)
    out = {"meta": {"project": proj, "runAt": RUN_AT, "today": str(TODAY),
                    "windowStart": str(WINDOW_START), "windowEnd": str(TODAY),
                    "statsStart": cfg["stats_start"], "traversalSince": trav_start,
                    "aggCaliber": "作者日期(%ad)分桶 + 跨分支完整哈希去重；遍历按提交日期回看 60 天防回填截断（§1.0 防御条款）；分支引用统一 origin/<branch>（有 remote 时）",
                    "aggregatedBy": "reports/_scripts/pulse_tool.py（机械聚合，RUNBOOK §1.0 口径；判定由分析会话作出）"}}

    def slices(dt):
        return {"stats": dt >= stats_start, "window": dt >= win_start, "today": dt >= today0}

    def workdays(d1, d2):
        n, d = 0, d1
        while d <= d2:
            if d.weekday() < 5: n += 1
            d += datetime.timedelta(days=1)
        return n

    repos_out = []
    for name, branches, main, treeref in cfg["repos"]:
        path = os.path.join(cfg["base"], name)
        R = {"name": name, "path": path, "branches": {}, "errors": []}
        if not os.path.isdir(os.path.join(path, ".git")):
            R["errors"].append("无 .git"); repos_out.append(R); continue
        rc, rem, _ = git(path, "remote")
        has_remote = bool(rem.strip())
        R["hasRemote"] = has_remote
        def resolve(b):
            ref = ("origin/" + b) if has_remote else b
            rc, o, e = git(path, "rev-parse", "--verify", "--quiet", ref + "^{commit}")
            if rc == 0: return ref
            rc2, o2, e2 = git(path, "rev-parse", "--verify", "--quiet", b + "^{commit}")
            return b if rc2 == 0 else None
        commits = {}   # hash -> dict
        branch_order = []
        for b in branches:
            ref = resolve(b)
            info = {"ref": ref, "logFile": None}
            if ref is None:
                info["error"] = "分支不存在/无远程跟踪"; R["branches"][b] = info; continue
            branch_order.append(b)
            rc, log, err = git(path, "log", ref, "--since=" + trav_start,
                               "--pretty=format:%H%x01%P%x01%an%x01%ae%x01%ad%x01%s", "--date=iso")
            if rc != 0: info["error"] = "log 失败: " + err.strip()[:200]; R["branches"][b] = info; continue
            bsafe = b.replace("/", "_")
            raw_log = os.path.join(rawdir, f"{name}__{bsafe}.log.txt")
            io_open = io.open(raw_log, "w", encoding="utf-8"); io_open.write(log); io_open.close()
            rc, nlog, err2 = git(path, "log", ref, "--since=" + trav_start, "--numstat",
                                 "--pretty=format:COMMIT@%H")
            numstat_map = {}
            cur = None
            for ln in nlog.splitlines():
                if ln.startswith("COMMIT@"):
                    cur = ln[7:].strip(); numstat_map.setdefault(cur, [])
                elif ln.strip() and cur is not None:
                    parts = ln.split("\t")
                    if len(parts) >= 3:
                        a, d, p = parts[0], parts[1], parts[2]
                        try: ai, di = (int(a), int(d)) if a != "-" and d != "-" else (0, 0)
                        except ValueError: ai = di = 0
                        numstat_map[cur].append((ai, di, p))
            raw_ns = os.path.join(rawdir, f"{name}__{bsafe}.numstat.txt")
            f = io.open(raw_ns, "w", encoding="utf-8"); f.write(nlog); f.close()
            info["logFile"] = os.path.relpath(raw_log, rundir).replace("\\", "/")
            info["numstatFile"] = os.path.relpath(raw_ns, rundir).replace("\\", "/")
            info["rawLines"] = len(log.splitlines())
            for line in log.splitlines():
                if "\x01" not in line: continue
                h, par, an, ae, ad, subj = (line.split("\x01") + [""])[:6]
                dt = parse_iso(ad)
                if dt is None: continue
                c = commits.get(h)
                if c is None:
                    files = numstat_map.get(h, [])
                    ins = sum(x[0] for x in files); dele = sum(x[1] for x in files)
                    c = {"h": h[:10], "parents": par, "an": an, "ae": ae, "key": pkey(an, ae),
                         "ad": ad, "dt": dt, "s": subj, "branches": set(),
                         "files": files, "ins": ins, "del": dele,
                         "merge": is_merge(par), "cls": cls_of(subj)}
                    commits[h] = c
                c["branches"].add(b)
            R["branches"][b] = info
        # 聚合（作者日期分桶）
        def bucket(sel):
            rows = [c for c in commits.values() if sel(c["dt"])]
            eff = [c for c in rows if not c["merge"] and c["files"]]
            return rows, eff
        rows_all, _ = bucket(lambda dt: dt >= stats_start - datetime.timedelta(days=60))
        st_rows, st_eff = bucket(lambda dt: dt >= stats_start)
        w_rows, w_eff = bucket(lambda dt: dt >= win_start)
        t_rows, t_eff = bucket(lambda dt: dt >= today0)
        def agg(rows, eff):
            persons = {}
            for c in eff:
                p = persons.setdefault(c["key"], {"names": set(), "commits": 0, "ins": 0, "del": 0,
                    "days": set(), "lateNight": 0, "weekend": 0, "branches": {}, "modules": set(), "test": 0, "peak": {}})
                p["names"].add(c["an"]); p["commits"] += 1; p["ins"] += c["ins"]; p["del"] += c["del"]
                d = c["dt"].date(); p["days"].add(str(d))
                p["peak"][str(d)] = p["peak"].get(str(d), 0) + 1
                hr = c["dt"].hour
                if hr >= 22 or hr < 6: p["lateNight"] += 1
                if d.weekday() >= 5: p["weekend"] += 1
                for b in c["branches"]:
                    p["branches"][b] = p["branches"].get(b, 0) + 1
                for (ai, di, fp) in c["files"]:
                    p["modules"].add("/".join(fp.replace("\\", "/").split("/")[:2]) or fp)
                    if TEST_PAT.search(fp.replace("\\", "/")): p["test"] += 1; break
            return {"total": len(rows), "effective": len(eff),
                    "merge": sum(1 for c in rows if c["merge"]),
                    "ins": sum(c["ins"] for c in eff), "del": sum(c["del"] for c in eff),
                    "authors": len({c["key"] for c in eff}),
                    "big": [{"h": c["h"], "s": c["s"][:60], "files": len(c["files"]), "churn": c["ins"] + c["del"]}
                            for c in eff if len(c["files"]) > 15 or (c["ins"] + c["del"]) > 800],
                    "trivial": [{"h": c["h"], "s": c["s"][:60], "lines": c["ins"] + c["del"]}
                                for c in eff if (c["ins"] + c["del"]) <= 3],
                    "classification": {k: sum(1 for c in eff if c["cls"] == k) for k in
                                       ["feat", "fix", "refactor", "docs", "test", "chore", "style", "perf", "build", "ci", "revert", "其他"]},
                    "shortMsgs": [{"h": c["h"], "s": c["s"]} for c in rows if len(c["s"]) < 10],
                    "persons": {k: {"names": sorted(v["names"]), "commits": v["commits"], "ins": v["ins"], "del": v["del"],
                                    "activeDays": len(v["days"]), "lateNight": v["lateNight"], "weekend": v["weekend"],
                                    "branches": v["branches"], "modulesTouched": len(v["modules"]), "testCommits": v["test"],
                                    "peakDay": max(v["peak"].items(), key=lambda x: x[1])[0] if v["peak"] else None,
                                    "peakN": max(v["peak"].values()) if v["peak"] else 0}
                                for k, v in persons.items()}}
        R["window"] = agg(w_rows, w_eff)
        R["window"]["commits"] = [{"h": c["h"], "an": c["an"], "ae": c["ae"], "ad": c["ad"][:19], "s": c["s"],
                                   "merge": c["merge"], "ins": c["ins"], "del": c["del"], "branches": sorted(c["branches"])}
                                  for c in sorted(w_rows, key=lambda x: x["dt"])]
        R["today"] = agg(t_rows, t_eff)
        R["today"]["commits"] = [{"h": c["h"], "an": c["an"], "ad": c["ad"][:19], "s": c["s"]} for c in sorted(t_rows, key=lambda x: x["dt"])]
        R["lastCommitDayBeforeToday"] = max((str(c["dt"].date()) for c in commits.values() if c["dt"].date() < TODAY), default=None)
        # 逐日/逐周/饱和度窗口（统计期）
        daily = {}
        for c in st_rows: daily[str(c["dt"].date())] = daily.get(str(c["dt"].date()), 0) + 1
        R["daily"] = dict(sorted(daily.items()))
        # 逐日明细（dayDiff 上一变动日对照用；作者日期口径）
        dd = {}
        for c in st_rows:
            d = str(c["dt"].date())
            e = dd.setdefault(d, {"commits": 0, "effective": 0, "ins": 0, "del": 0, "authors": set()})
            e["commits"] += 1
            if not c["merge"] and c["files"]:
                e["effective"] += 1; e["ins"] += c["ins"]; e["del"] += c["del"]; e["authors"].add(c["key"])
        R["dayDetail"] = {d: {"commits": v["commits"], "effective": v["effective"], "ins": v["ins"], "del": v["del"],
                              "authors": sorted(v["authors"])} for d, v in sorted(dd.items())}
        weeks = []
        d0 = stats_start.date()
        wi = 0
        while d0 <= TODAY:
            dend = min(d0 + datetime.timedelta(days=6), TODAY)
            weeks.append({"idx": wi, "start": str(d0), "end": str(dend), "workdays": workdays(d0, dend)})
            d0 = dend + datetime.timedelta(days=1); wi += 1
        def inwin(dt, w):
            return stats_start.date() <= dt.date() and w["start"] <= str(dt.date()) <= w["end"] and dt.date() >= datetime.date.fromisoformat(w["start"])
        sat_windows = []
        for w in weeks:
            wrows = [c for c in st_rows if w["start"] <= str(c["dt"].date()) <= w["end"]]
            weff = [c for c in wrows if not c["merge"] and c["files"]]
            pw = {}
            for c in weff:
                p = pw.setdefault(c["key"], {"names": set(), "eff": 0, "ins": 0, "del": 0, "days": set(), "nonwork": 0})
                p["names"].add(c["an"]); p["eff"] += 1; p["ins"] += c["ins"]; p["del"] += c["del"]
                p["days"].add(str(c["dt"].date()))
                hr = c["dt"].hour
                if hr >= 22 or hr < 6 or c["dt"].date().weekday() >= 5: p["nonwork"] += 1
            sat_windows.append({"idx": w["idx"], "start": w["start"], "end": w["end"], "workdays": w["workdays"],
                                "persons": {k: {"names": sorted(v["names"]), "effective": v["eff"], "ins": v["ins"], "del": v["del"],
                                                "activeDays": len(v["days"]), "nonworkCommits": v["nonwork"]} for k, v in sorted(pw.items())}})
        R["saturationWindows"] = sat_windows
        # 逐周（§1.17 展示口径）
        R["weekly"] = [{"label": w["start"], "start": w["start"], "end": w["end"],
                        "commits": sum(1 for c in st_rows if w["start"] <= str(c["dt"].date()) <= w["end"]),
                        "effective": sum(1 for c in st_eff if w["start"] <= str(c["dt"].date()) <= w["end"]),
                        "authors": len({c["key"] for c in st_eff if w["start"] <= str(c["dt"].date()) <= w["end"]}),
                        "ins": sum(c["ins"] for c in st_eff if w["start"] <= str(c["dt"].date()) <= w["end"]),
                        "del": sum(c["del"] for c in st_eff if w["start"] <= str(c["dt"].date()) <= w["end"])}
                       for w in weeks]
        R["statsWorkdays"] = workdays(stats_start.date(), TODAY)
        # 分支位置
        mref = resolve(main)
        R["mainBranch"] = {"branch": main, "ref": mref}
        if mref:
            rc, o, _ = git(path, "log", "-1", "--format=%ad", "--date=short", mref)
            R["mainBranch"]["lastActive"] = o.strip()
        brs = []
        for b in branches:
            if b == main: continue
            ref = resolve(b)
            if ref is None or mref is None:
                brs.append({"name": b, "error": "分支或主干引用不可用"}); continue
            rc, oa, _ = git(path, "rev-list", "--count", f"{mref}..{ref}")
            rc2, ob, _ = git(path, "rev-list", "--count", f"{ref}..{mref}")
            rc3, mb, _ = git(path, "merge-base", mref, ref)
            entry = {"name": b, "ref": ref, "ahead": int(oa) if rc == 0 and oa.strip() else None,
                     "behind": int(ob) if rc2 == 0 and ob.strip() else None}
            if rc3 == 0 and mb.strip():
                rc4, fd, _ = git(path, "log", "-1", "--format=%ad", "--date=short", mb.strip())
                entry["forkDate"] = fd.strip()
                try: entry["staleDays"] = (TODAY - datetime.date.fromisoformat(fd.strip())).days
                except ValueError: pass
            rc5, la, _ = git(path, "log", "-1", "--format=%ad", "--date=short", ref)
            entry["lastActive"] = la.strip() if rc5 == 0 else None
            brs.append(entry)
        R["branchPos"] = brs
        # 规模与质量（工作副本 / pat-crosssem 用主开发分支树快照，见 context 口径偏差记录）
        rc, head, _ = git(path, "rev-parse", "--abbrev-ref", "HEAD")
        R["checkedOut"] = head.strip() if rc == 0 else None
        q = {}
        try:
            if treeref:
                rc, fl, _ = git(path, "ls-tree", "-r", "--name-only", treeref)
                files = [x for x in fl.splitlines() if x.strip()]
                linecnt = {}
                rc, lc, _ = git(path, "grep", "-I", "-c", "", treeref)
                for ln in lc.splitlines():
                    seg = ln.split(":", 2)
                    if len(seg) == 3:
                        try: linecnt[seg[1]] = int(seg[2])
                        except ValueError: pass
                rc, td, _ = git(path, "grep", "-I", "-i", "-c", "-e", "TODO", "-e", "FIXME", treeref)
                todo_files = {}
                for ln in td.splitlines():
                    seg = ln.split(":", 2)
                    if len(seg) == 3:
                        try: todo_files[seg[1]] = int(seg[2])
                        except ValueError: pass
                q["mode"] = f"树快照 {treeref}（主干空心，context 口径偏差记录）"
            else:
                rc, fl, _ = git(path, "ls-files")
                files = [x for x in fl.splitlines() if x.strip()]
                linecnt = {}
                todo_files = {}
                for rel in files:
                    n = count_lines_working(path, rel)
                    if n is None: continue
                    linecnt[rel] = n
                    try:
                        with open(os.path.join(path, rel), "rb") as f2:
                            txt = f2.read().decode("utf-8", "replace")
                        c2 = sum(1 for ln2 in txt.splitlines() if re.search(r"TODO|FIXME", ln2, re.I))
                        if c2: todo_files[rel] = c2
                    except OSError:
                        pass
                q["mode"] = "工作副本（当前检出分支口径 §1.6）"
            q["checkedOut"] = R["checkedOut"]
            langs = {}
            for fp, n in linecnt.items():
                ext = os.path.splitext(fp)[1].lower() or "(无扩展名)"
                L = langs.setdefault(ext, {"files": 0, "lines": 0})
                L["files"] += 1; L["lines"] += n
            q["languages"] = sorted([{"ext": k, "files": v["files"], "lines": v["lines"]} for k, v in langs.items()],
                                    key=lambda x: -x["lines"])[:12]
            q["largeFiles"] = sorted([{"path": k, "lines": v} for k, v in linecnt.items() if v > 1500],
                                     key=lambda x: -x["lines"])[:5]
            q["todoTotal"] = sum(todo_files.values())
            q["todoTop"] = sorted([{"path": k, "count": v} for k, v in todo_files.items()], key=lambda x: -x["count"])[:10]
            q["stockTestFiles"] = sum(1 for fp in files if TEST_PAT.search(fp.replace("\\", "/")) and ".testtmp" not in fp)
            q["trackedFiles"] = len(files)
        except Exception as ex:
            q["error"] = str(ex)[:300]
        R["quality"] = q
        # 全生命周期（§1.15，--all 全分支）
        rc, alllog, err = git(path, "log", "--all", "--pretty=format:%H%x01%an%x01%ae%x01%ad", "--date=short")
        if rc == 0:
            seen = set(); monthly = {}; authors = {}; first = last = None
            for ln in alllog.splitlines():
                if "\x01" not in ln: continue
                h, an, ae, ad = (ln.split("\x01") + [""])[:4]
                if h in seen or not ad: continue
                seen.add(h)
                m = ad[:7]; monthly[m] = monthly.get(m, 0) + 1
                k = ae or an; authors[k] = authors.get(k, 0) + 1
                if first is None or ad < first: first = ad
                if last is None or ad > last: last = ad
            top = sorted(authors.items(), key=lambda x: -x[1])[:5]
            R["lifetime"] = {"first": first, "last": last, "totalCommits": len(seen), "authors": len(authors),
                             "monthly": monthly, "monthlyCount": len(monthly),
                             "topAuthors": [{"key": k, "commits": v} for k, v in top]}
        else:
            R["lifetime"] = {"error": err.strip()[:200]}
        repos_out.append(R)
    out["repos"] = repos_out
    # 文档 mtime（上一变动日文档侧证据）
    def scan_docs(base, skip_repos):
        rows = []
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [d for d in dirnames if d not in (".git", "node_modules") ]
            if skip_repos and any(os.path.basename(os.path.normpath(dirpath)) == r for r in skip_repos):
                dirnames[:] = []
            for fn in filenames:
                if fn.lower().endswith((".md", ".txt")):
                    fp = os.path.join(dirpath, fn)
                    try:
                        mt = datetime.datetime.fromtimestamp(os.path.getmtime(fp))
                        rows.append({"path": os.path.relpath(fp, ROOT).replace("\\", "/"), "mtime": mt.strftime("%Y-%m-%d %H:%M"), "date": str(mt.date())})
                    except OSError:
                        pass
        return rows
    proj_docs = scan_docs(cfg["base"], [r[0] for r in cfg["repos"]])
    glob_docs = scan_docs("docs", None)
    out["docsMtime"] = {"project": sorted(proj_docs, key=lambda x: -os.path.getmtime(os.path.join(ROOT, x["path"])))[:10],
                        "global": sorted(glob_docs, key=lambda x: -os.path.getmtime(os.path.join(ROOT, x["path"])))[:10]}
    with io.open(os.path.join(evdir, "agg.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1, default=str)
    print(f"[collect] {proj}: repos={len(repos_out)} agg.json -> {evdir}")
    for R in repos_out:
        w = R.get("window", {})
        print(f"  {R['name']}: 窗口 {w.get('total')} commits ({w.get('merge')} merge), authors={w.get('authors')}, errors={len(R['errors'])}"
              + ("; " + "; ".join(b + ':' + R['branches'][b].get('error', '')[:40] for b in R['branches'] if R['branches'][b].get('error')) if any(R['branches'][b].get('error') for b in R['branches']) else ""))

# ---------- extractprev ----------
def _extract_block(html):
    last_err = None
    start = 0
    while True:
        i = html.find("window.REPORT_DATA = {", start)
        if i < 0:
            raise ValueError(f"REPORT_DATA 块解析失败: {last_err}")
        try:
            return _parse_block_at(html, i)
        except (ValueError, json.JSONDecodeError) as e:
            last_err = e
            start = i + 1

def _parse_block_at(html, i):
    # 括号配平扫描（字符串与行注释感知）确定数据对象结尾
    p = i + len("window.REPORT_DATA = ")
    while p < len(html) and html[p] != "{":
        p += 1
    if p >= len(html): raise ValueError("起始 { 未找到")
    depth = 0; q = None; esc = False; t = p; end = -1; n = len(html)
    while t < n:
        c = html[t]
        if q:
            if esc: esc = False
            elif c == "\\": esc = True
            elif c == q: q = None
            t += 1; continue
        if c in ('"', "'"):
            q = c; t += 1; continue
        if c == "/" and t + 1 < n and html[t + 1] == "/":
            nl = html.find("\n", t)
            t = (nl + 1) if nl >= 0 else n
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                end = t + 1
                break
        t += 1
    if end < 0: raise ValueError("块尾未配平")
    seg = html[p:end]
    # 扫描器：分段处理——字符串原样保留（单引号转双引号），字符串外去 // 注释并给无引号键加引号
    out = []
    n = len(seg); p = 0
    KEY_RE = re.compile(r"([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)")
    TAIL_RE = re.compile(r",(\s*[}\]])")
    while p < n:
        ch = seg[p]
        if ch in ('"', "'"):
            q = ch; buf = ['"']; p += 1
            while p < n:
                c = seg[p]
                if c == "\\" and p + 1 < n:
                    nxt = seg[p + 1]
                    if q == "'" and nxt == "'":
                        buf.append("'")
                    else:
                        buf.append(c); buf.append(nxt)
                    p += 2; continue
                if c == q:
                    p += 1; break
                if q == "'" and c == '"':
                    buf.append('\\"')
                else:
                    buf.append(c)
                p += 1
            buf.append('"')
            out.append("".join(buf))
        elif ch == "/" and p + 1 < n and seg[p + 1] == "/":
            while p < n and seg[p] != "\n": p += 1
        else:
            out.append(ch); p += 1
    s = "".join(out)
    # 在非字符串区做键加引号与尾逗号清理：逐段（以字符串为界）处理
    parts = re.split(r'("(?:[^"\\]|\\.)*")', s)
    for idx in range(0, len(parts), 2):
        parts[idx] = TAIL_RE.sub(r"\1", KEY_RE.sub(r'\1"\2"\3', parts[idx]))
    s = "".join(parts)
    return json.loads(s)

def extractprev(proj, oldrundir, rundir):
    html = io.open(os.path.join(oldrundir, "index.html"), encoding="utf-8").read()
    data = _extract_block(html)
    evdir = os.path.join(rundir, "_evidence"); os.makedirs(evdir, exist_ok=True)
    with io.open(os.path.join(evdir, "prev_report_data.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"[extractprev] {proj}: meta.period={data.get('meta', {}).get('period')} keys={sorted(data.keys())}")

# ---------- splice ----------
def splice(proj, rundir, datajson):
    tpl = io.open("assets/report_template.html", encoding="utf-8").read()
    data = io.open(datajson, encoding="utf-8").read().strip()
    i = tpl.find("window.REPORT_DATA = {")
    j = tpl.find("var DATA = window.REPORT_DATA", i)
    k = tpl.rfind("};", i, j)
    new = tpl[:i] + "window.REPORT_DATA = " + data + ";\n" + tpl[k + 2:]
    ech = io.open("assets/echarts.min.js", encoding="utf-8").read()
    marker = '<script src="../../../assets/echarts.min.js"></script>'
    if marker in new:
        new = new.replace(marker, "<script>/* echarts.min.js 内联（v4.5 自包含化）*/\n" + ech + "\n</script>")
    else:
        print("[splice][WARN] echarts 外链标记未找到（可能已内联）")
    # SPEC-016 v3：新期仪表盘自动携带返回浮标（独立运营项目不注入）
    if proj not in STANDALONE_PROJECTS:
        new = _inject_backfloat(new)
    outp = os.path.join(rundir, "index.html")
    with io.open(outp, "w", encoding="utf-8", newline="\n") as f:
        f.write(new)
    print(f"[splice] {proj}: index.html {os.path.getsize(outp)} bytes, echarts={'内联' if marker in tpl else '?'}")

# ---------- portal（SPEC-016：零依赖静态门户，只读归档、追加式生成） ----------
LEVEL_COLOR = {"低": "#52c41a", "中": "#faad14", "高": "#fa8c16", "严重": "#f5222d"}
CN_OVERRIDE = {"order-system": "演练项目"}
# 独立运营项目（SPEC-016 v2，用户 2026-11-02 口径）：不进入总入口卡片与项目/期数统计；
# 其引导页仍生成，但不含回主页面包屑与 ../index.html 引用（可单独打包部署）。
STANDALONE_PROJECTS = {"pat-crosssem"}

def _esc(s):
    return html.escape(str(s), quote=True)

def _cn_name(key):
    if key in CN_OVERRIDE:
        return CN_OVERRIDE[key]
    try:
        for d in sorted(os.listdir("docs")):
            m = re.match(rf"^{re.escape(key)}[-—_](.+)$", d)
            if m and os.path.isdir(os.path.join("docs", d)):
                return m.group(1)
    except OSError:
        pass
    return None

def _fmt_total(t):
    try:
        return f"{float(t):g}"
    except (TypeError, ValueError):
        return "—"

def _fmt_delta(d):
    try:
        v = float(d)
    except (TypeError, ValueError):
        return ""
    if v > 0: return f'<span class="delta" style="color:#f5222d">↑ +{v:g}</span>'
    if v < 0: return f'<span class="delta" style="color:#52c41a">↓ {v:g}</span>'
    return '<span class="delta" style="color:#8a8f99">→ 持平</span>'

def _scan_reports():
    """扫描 reports/：返回 [{name, cn, runs:[{dir, meta, headline, repos, reposMd, hasIdx}]}]，runs 按目录名升序。"""
    projects = []
    for name in sorted(os.listdir("reports")):
        pdir = os.path.join("reports", name)
        if not os.path.isdir(pdir) or name.startswith("_"):
            continue
        runs = []
        for rd in sorted(os.listdir(pdir)):
            if not re.match(r"^\d{4}-\d{2}-\d{2}-\d{6}$", rd):
                continue
            rdir = os.path.join(pdir, rd)
            if not os.path.isdir(rdir):
                continue
            entry = {"dir": rd, "meta": None, "headline": "", "repos": [], "reposMd": [], "hasIdx": False, "error": ""}
            idx = os.path.join(rdir, "index.html")
            if os.path.isfile(idx):
                entry["hasIdx"] = True
                try:
                    data = _extract_block(io.open(idx, encoding="utf-8").read())
                    entry["meta"] = data.get("meta") or {}
                    entry["headline"] = data.get("headline") or ""
                    entry["repos"] = [{"name": r.get("name"), "total": r.get("total"), "level": r.get("level"),
                                       "delta": r.get("delta")} for r in data.get("repos", []) if isinstance(r, dict)]
                except Exception as ex:
                    entry["error"] = f"REPORT_DATA 解析失败: {ex}"[:160]
            try:
                entry["reposMd"] = sorted(d for d in os.listdir(rdir)
                                          if os.path.isdir(os.path.join(rdir, d))
                                          and os.path.isfile(os.path.join(rdir, d, "report.md")))
            except OSError:
                pass
            runs.append(entry)
        if runs:
            projects.append({"name": name, "cn": _cn_name(name), "runs": runs})
    return projects

def _period_label(run):
    m = run.get("meta") or {}
    p = m.get("period")
    at = m.get("runAt")
    if not at:
        dm = re.match(r"^(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})(\d{2})$", run["dir"])
        at = f"{dm.group(1)} {dm.group(2)}:{dm.group(3)}:{dm.group(4)}" if dm else run["dir"]
    if not p:
        return None, at
    return p, at

def _chip(r, base):
    name = str(r.get("name") or "?")
    lvl = r.get("level") or ""
    color = LEVEL_COLOR.get(lvl, "#8a8f99")
    href = f"{base}/{_urlquote(name)}/report.md"
    return (f'<a class="chip" href="{href}" title="{_esc(name)} 分册报告">'
            f'<span class="cn">{_esc(name)}</span>'
            f'<b style="color:{color}">{_fmt_total(r.get("total"))}</b>'
            f'<span class="lv" style="background:{color}">{_esc(lvl)}</span>'
            f'{_fmt_delta(r.get("delta"))}</a>')

_PORTAL_CSS = """
:root{--bg:#f5f7fa;--card:#fff;--line:#e5e8ee;--tx:#1f2733;--sub:#5a6472}
*{box-sizing:border-box}body{margin:0;font-family:"Microsoft YaHei","PingFang SC",system-ui,sans-serif;background:var(--bg);color:var(--tx)}
header{background:#1f2733;color:#fff;padding:22px 28px}header h1{margin:4px 0 6px;font-size:22px}
.crumbs{font-size:13px;margin-bottom:8px;color:#b8c0cc}.crumbs a{color:#8ec2ff;text-decoration:none}.crumbs a:hover{text-decoration:underline}
.crumbs .sep{margin:0 7px;color:#5a6472}.crumbs .cur{color:#e8edf4}.crumbs .tag{border:1px solid #5a6472;border-radius:999px;padding:1px 8px;font-size:11px;color:#b8c0cc}
header .sub{color:#b8c0cc;font-size:13px;line-height:1.7}header a{color:#8ec2ff;text-decoration:none}
main{max-width:1180px;margin:24px auto;padding:0 20px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px 18px;box-shadow:0 1px 3px rgba(16,24,40,.06)}
.card h2{margin:0 0 2px;font-size:17px}.card .en{color:var(--sub);font-size:12px;font-weight:400;margin-left:6px}
.card .meta{color:var(--sub);font-size:12.5px;margin:6px 0 10px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px}
.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:3px 10px;font-size:12.5px;color:var(--tx);text-decoration:none;background:#fafbfc}
.chip:hover{border-color:#8ec2ff;background:#f2f8ff}.chip .lv{color:#fff;border-radius:999px;padding:1px 7px;font-size:11px}
.chip .delta{font-size:11.5px}
.links a{display:inline-block;margin-right:12px;color:#1a66d6;text-decoration:none;font-size:13.5px}
.links a:hover{text-decoration:underline}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden}
th,td{padding:11px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;font-size:13.5px}
th{background:#f0f3f8;font-size:12.5px;color:var(--sub)}
tr:last-child td{border-bottom:none}
.badge{display:inline-block;background:#1a66d6;color:#fff;border-radius:4px;font-size:11px;padding:1px 6px;margin-left:6px;vertical-align:2px}
.win{color:var(--sub);font-size:12px;white-space:nowrap}
.hl{color:var(--sub);font-size:12.5px;margin-top:6px;max-width:560px}
.err{color:#f5222d;font-size:12px}
footer{max-width:1180px;margin:18px auto 30px;padding:0 20px;color:#8a8f99;font-size:12px;line-height:1.8}
@media print{header{-webkit-print-color-adjust:exact}}
"""

def _footer(_gen_at=None):
    return ("<footer>GitPulse 报告门户 · 生成命令：<code>python -I reports/_scripts/pulse_tool.py portal</code>"
            f"（SPEC-016；只读归档、幂等重跑）<br>⚠ 敏感度提示：本站聚合全部监测汇总数据（项目、成员评分、风险结论），"
            f"公网发布前请自行评估敏感度（RUNBOOK §5.4.2）；期报告均为单文件自包含，可离线打开。</footer>")

# SPEC-016 v3：返回项目引导固定浮标（纯静态、gp-back 标记防重、不触碰 REPORT_DATA 与渲染 JS）
_BACKFLOAT = ('<a class="gp-back" href="../index.html">← 返回项目引导</a>'
              '<style>.gp-back{position:fixed;right:18px;bottom:18px;z-index:9999;background:#1f2733;color:#fff;'
              'padding:8px 14px;border-radius:999px;font-size:13px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.25);opacity:.85}'
              '.gp-back:hover{opacity:1;background:#1a66d6}</style>')

def _inject_backfloat(html_text):
    """在 </body> 前注入返回浮标；已含 gp-back 标记则原样返回（幂等）；无 </body> 不处理。"""
    if "gp-back" in html_text:
        return html_text
    i = html_text.rfind("</body>")
    if i < 0:
        return html_text
    return html_text[:i] + _BACKFLOAT + "\n" + html_text[i:]

def portal():
    projects = _scan_reports()
    written = []
    # 1) 项目引导页
    for proj in projects:
        runs_desc = list(reversed(proj["runs"]))
        latest = runs_desc[0]
        lp, lat = _period_label(latest)
        rows = []
        for i, run in enumerate(runs_desc):
            p, at = _period_label(run)
            base = run["dir"]
            m = run.get("meta") or {}
            ptxt = f"第 {_esc(p)} 期" if p else "期数—"
            badge = '<span class="badge">最新</span>' if i == 0 else ""
            chips = "".join(_chip(r, base) for r in run["repos"]) or '<span class="err">无仓库数据</span>'
            extra_md = "".join(f'<a href="{base}/{_urlquote(d)}/report.md">{_esc(d)}</a>'
                               for d in run.get("reposMd", []) if d not in {str(r.get("name")) for r in run["repos"]})
            dash = (f'<a href="{base}/index.html">打开仪表盘</a>' if run["hasIdx"] else '<span class="err">无 index.html</span>')
            hl = f'<div class="hl">{_esc(run["headline"])}</div>' if run["headline"] else ""
            err = f'<div class="err">{_esc(run["error"])}</div>' if run["error"] else ""
            rows.append(
                f"<tr><td><b>{ptxt}</b>{badge}<div class=win>{_esc(at)}</div></td>"
                f"<td class=win>{_esc(m.get('window', ''))}<br>统计期 {_esc(m.get('statsRange', ''))}</td>"
                f"<td><div class=chips>{chips}</div>{hl}{err}"
                f"<div class=chips>{extra_md}</div></td>"
                f"<td class=links>{dash}<br><a href=\"{base}/summary.md\">summary.md</a></td></tr>")
        title = f"{proj['cn']} · {proj['name']}" if proj["cn"] else proj["name"]
        # 面包屑（SPEC-016 v2）：非独立项目 = 首页/项目名（可回退主页）；独立项目 = 项目名/独立运营标识，无主页链接
        if proj["name"] in STANDALONE_PROJECTS:
            crumbs = (f'<nav class="crumbs"><span class="cur">{_esc(proj["cn"] or proj["name"])}</span>'
                      f'<span class="sep">/</span><span class="tag">独立运营 · 不入总入口</span></nav>')
        else:
            crumbs = (f'<nav class="crumbs"><a href="../index.html">首页</a>'
                      f'<span class="sep">/</span><span class="cur">{_esc(proj["cn"] or proj["name"])}</span></nav>')
        page = (f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GitPulse · {_esc(title)} 报告引导</title><style>{_PORTAL_CSS}</style></head>
<body>
<header>{crumbs}<h1>{_esc(title)}</h1>
<div class="sub">共 {len(proj["runs"])} 期 pulse 评估 · 最新一期：第 {lp} 期（{lat}）· 点击各期「打开仪表盘」查看完整可视化报告，仓库名徽章可直达该仓分册</div></header>
<main>
<table><tr><th style="width:130px">期次</th><th style="width:210px">时间口径</th><th>各仓库评分（点击仓库名打开分册）</th><th style="width:130px">报告入口</th></tr>
{''.join(rows)}
</table>
</main>
{_footer()}
</body></html>""")
        out = os.path.join("reports", proj["name"], "index.html")
        with io.open(out, "w", encoding="utf-8", newline="\n") as f:
            f.write(page)
        written.append(out)
    # 2) 总入口（SPEC-016 v2：排除独立运营项目）
    main_projects = [p for p in projects if p["name"] not in STANDALONE_PROJECTS]
    cards = []
    projs_desc = sorted(main_projects, key=lambda p: p["runs"][-1]["dir"], reverse=True)
    for proj in projs_desc:
        latest = proj["runs"][-1]
        lp, lat = _period_label(latest)
        title = f"{proj['cn']} · {proj['name']}" if proj["cn"] else proj["name"]
        chips = "".join(_chip(r, f"{proj['name']}/{latest['dir']}") for r in latest["repos"])
        hl = f'<div class="hl">{_esc(latest["headline"])}</div>' if latest["headline"] else ""
        cards.append(f"""<div class="card">
<h2>{_esc(proj["cn"] or proj["name"])}<span class="en">{_esc(proj["name"])}</span></h2>
<div class="meta">共 {len(proj["runs"])} 期 · 最新：第 {lp} 期（{lat}）</div>
<div class="chips">{chips}</div>{hl}
<div class="links"><a href="{proj["name"]}/index.html">进入项目（全部 {_esc(str(len(proj["runs"])))} 期） →</a><a href="{proj["name"]}/{latest["dir"]}/index.html">最新一期仪表盘 →</a></div>
</div>""")
    top = (f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GitPulse 报告门户 · 研发项目风险监测</title><style>{_PORTAL_CSS}</style></head>
<body>
<header><h1>GitPulse 报告门户 · 研发项目风险监测</h1>
<div class="sub">共 {len(main_projects)} 个项目 · {sum(len(p["runs"]) for p in main_projects)} 期评估报告 · 点击项目卡片进入其全部历史期（引导页顶部面包屑可一键返回本页）；评分徽章配色：低绿 / 中黄 / 高橙 / 严重红（RUNBOOK §5.4.3）{f'；独立运营项目不在此入口呈现（共 {len(projects) - len(main_projects)} 个，另行部署）' if STANDALONE_PROJECTS else ''}</div></header>
<main><div class="grid">{''.join(cards)}</div></main>
{_footer()}
</body></html>""")
    with io.open(os.path.join("reports", "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(top)
    written.append(os.path.join("reports", "index.html"))
    # 3) SPEC-016 v3：存量归档仪表盘返回浮标注入（幂等；独立运营项目不注入）
    injected = []
    for proj in projects:
        if proj["name"] in STANDALONE_PROJECTS:
            continue
        for run in proj["runs"]:
            idx = os.path.join("reports", proj["name"], run["dir"], "index.html")
            if not os.path.isfile(idx):
                continue
            txt = io.open(idx, encoding="utf-8").read()
            new = _inject_backfloat(txt)
            if new != txt:
                with io.open(idx, "w", encoding="utf-8", newline="\n") as f:
                    f.write(new)
                injected.append(idx)
    if injected:
        print(f"[portal] v3 返回浮标注入 {len(injected)} 期归档仪表盘（独立运营项目不注入）：")
        for w in injected:
            print("  ~", w.replace("\\", "/"))
    # 4) 内置自检：链接有效性 + 零外链（AC3/AC4）
    bad_links, ext_refs = [], []
    for page_path in written:
        base_dir = os.path.dirname(page_path)
        txt = io.open(page_path, encoding="utf-8").read()
        for attr, target in re.findall(r'(href|src)="([^"]+)"', txt):
            if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target) or target.startswith("//"):
                ext_refs.append((page_path, target)); continue
            t = target.split("#")[0]
            if not t:
                continue
            full = os.path.normpath(os.path.join(base_dir, t))
            if not os.path.exists(full):
                bad_links.append((page_path, target))
        for pat in ("https://", "http://", "../assets"):
            if pat in txt:
                ext_refs.append((page_path, pat))
    print(f"[portal] 项目 {len(projects)} 个（总入口呈现 {len(main_projects)}，独立运营 {len(projects) - len(main_projects)}）/ 期次 {sum(len(p['runs']) for p in projects)} 期；写入 {len(written)} 页：")
    for w in written:
        print("  +", w.replace("\\", "/"))
    print(f"[portal] 自检：死链 {len(bad_links)} 个，外链/越界引用 {len(ext_refs)} 个")
    for b in bad_links + ext_refs:
        print("  ✗", b[0].replace("\\", "/"), "->", b[1])
    return 0 if not bad_links and not ext_refs else 1

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "collect": collect(sys.argv[2], sys.argv[3])
    elif cmd == "extractprev": extractprev(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == "splice": splice(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == "portal": sys.exit(portal())
