# -*- coding: utf-8 -*-
"""GitPulse REPORT_DATA 构建器：机械字段从 agg.json/prev_report_data.json/raw 留痕计算，
判定字段（评分/风险/计划/人话结论等）由分析会话以 lit JSON 注入（RUNBOOK §1.0 机械聚合口径）。
用法: python -I build.py <project> <rundir> <lit.json>
输出: <rundir>/data.json（供 pulse_tool.py splice 生成 index.html）
"""
import json, io, os, re, sys, datetime, collections

TZ8 = datetime.timezone(datetime.timedelta(hours=8))
TEST_PAT = re.compile(r"(^|/)(test|tests|__tests__|src/test|e2e)(/|$)|(^|/)(test_[^/]*|[^/]*_test\.[^/]*|[^/]*\.test\.[^/]*|[^/]*\.spec\.[^/]*|[^/]*Test\.java|[^/]*Tests\.java|[^/]*IT\.java)$")
CLS = ["feat", "fix", "refactor", "docs", "test", "chore", "style", "perf", "build", "ci", "revert", "其他"]

def load(p): return json.load(io.open(p, encoding="utf-8"))

def parse_iso(s):
    s = s.strip()
    try: return datetime.datetime.strptime(s, "%Y-%m-%d %H:%M:%S %z")
    except ValueError:
        try: return datetime.datetime.strptime(s[:19], "%Y-%m-%d %H:%M:%S").replace(tzinfo=TZ8)
        except ValueError: return None

def is_merge(p): return " " in p.strip()

def cls_of(s):
    m = re.match(r"^\s*(feat|fix|refactor|docs|test|chore|style|perf|build|ci|revert)\b", s, re.I)
    return m.group(1).lower() if m else "其他"

def level_of(t): return "低" if t <= 25 else "中" if t <= 50 else "高" if t <= 75 else "严重"

def person_level(cov, deff, dlines):
    if cov >= 0.6 and deff >= 3.0 and dlines >= 600: return 2, "高"
    if (cov >= 0.3 and (deff >= 2.0 or dlines >= 200)) or cov >= 0.5: return 1, "中"
    return 0, "低"

def disp_of(an, ae, member_map, aliases):
    for a in aliases:
        if (a.get("email_contains") and ae and a["email_contains"] in ae) or (a.get("name_in") and a["name_in"] == an):
            return a["canon"]
    if ae in member_map: return member_map[ae]
    return f"{an}（待映射）"

def key_of(an, ae, aliases):
    for a in aliases:
        if (a.get("email_contains") and ae and a["email_contains"] in ae) or (a.get("name_in") and a["name_in"] == an):
            return a["canon"]
    return ae or ("name:" + an)

def main():
    proj, rundir, litpath = sys.argv[1], sys.argv[2], sys.argv[3]
    agg = load(os.path.join(rundir, "_evidence", "agg.json"))
    prev = load(os.path.join(rundir, "_evidence", "prev_report_data.json"))
    lit = load(litpath)
    meta_a = agg["meta"]
    today = datetime.date.fromisoformat(meta_a["today"])
    win_start = datetime.date.fromisoformat(meta_a["windowStart"])
    stats_start = datetime.date.fromisoformat(meta_a["statsStart"])
    run_at = meta_a["runAt"]
    member_map = lit.get("memberMap", {}); aliases = lit.get("aliases", [])
    disp = lambda an, ae: disp_of(an, ae, member_map, aliases)
    key = lambda an, ae: key_of(an, ae, aliases)

    # 末饱和窗（项目内同锚，取首个含序列的仓）
    agg_win = None
    for R in agg["repos"]:
        if R.get("saturationWindows"): agg_win = R["saturationWindows"]; break
    lw = agg_win[-1] if agg_win else None
    lw_lo = datetime.date.fromisoformat(lw["start"]) if lw else None
    lw_hi = datetime.date.fromisoformat(lw["end"]) if lw else None
    # 项目级末窗人员（跨仓日级并集）
    proj_lw = {}

    rawdir = os.path.join(rundir, "_evidence", "raw")
    repos_out = []
    prev_by_name = {r["name"]: r for r in prev.get("repos", [])}
    for R in agg["repos"]:
        name = R["name"]; L = lit["repos"][name]
        commits = {}
        for b, binfo in R.get("branches", {}).items():
            lf = binfo.get("logFile")
            if not lf: continue
            lp = os.path.join(rundir, lf)
            if not os.path.exists(lp): continue
            nsf = os.path.join(rundir, binfo.get("numstatFile", ""))
            numstat = {}; cur = None
            if os.path.exists(nsf):
                for ln in io.open(nsf, encoding="utf-8"):
                    ln = ln.rstrip("\n")
                    if ln.startswith("COMMIT@"):
                        cur = ln[7:].strip(); numstat.setdefault(cur, [])
                    elif ln.strip() and cur:
                        parts = ln.split("\t")
                        if len(parts) >= 3:
                            try: ai, di = (int(parts[0]), int(parts[1])) if parts[0] != "-" and parts[1] != "-" else (0, 0)
                            except ValueError: ai = di = 0
                            numstat[cur].append((ai, di, parts[2]))
            for line in io.open(lp, encoding="utf-8"):
                line = line.rstrip("\n")
                if "\x01" not in line: continue
                h, par, an, ae, ad, s = (line.split("\x01") + [""])[:6]
                dt = parse_iso(ad)
                if dt is None: continue
                c = commits.get(h)
                if c is None:
                    files = numstat.get(h, [])
                    commits[h] = {"h": h[:10], "an": an, "ae": ae, "key": key(an, ae), "dt": dt, "s": s,
                                  "branches": set(), "files": files,
                                  "ins": sum(x[0] for x in files), "del": sum(x[1] for x in files), "merge": is_merge(par)}
                commits[h]["branches"].add(b)
        win0 = datetime.datetime.combine(win_start, datetime.time(0, 0), tzinfo=TZ8)
        st0 = datetime.datetime.combine(stats_start, datetime.time(0, 0), tzinfo=TZ8)
        w_rows = [c for c in commits.values() if c["dt"] >= win0]
        w_eff = [c for c in w_rows if not c["merge"] and c["files"]]
        s_rows = [c for c in commits.values() if c["dt"] >= st0]
        s_eff = [c for c in s_rows if not c["merge"] and c["files"]]
        # 项目级末窗累计（跨仓并集）
        if lw:
            for c in w_eff:
                d = c["dt"].date()
                if lw_lo <= d <= lw_hi:
                    e = proj_lw.setdefault(c["key"], {"names": set(), "an": c["an"], "ae": c["ae"], "eff": 0, "ins": 0, "del": 0, "days": set(), "nonwork": 0})
                    e["names"].add(c["an"]); e["eff"] += 1; e["ins"] += c["ins"]; e["del"] += c["del"]; e["days"].add(str(d))
                    if c["dt"].hour >= 22 or c["dt"].hour < 6 or d.weekday() >= 5: e["nonwork"] += 1

        def personify(rows_eff):
            p = {}
            for c in rows_eff:
                d = p.setdefault(c["key"], {"names": set(), "an": c["an"], "ae": c["ae"], "commits": 0, "ins": 0, "del": 0,
                                            "days": set(), "late": 0, "wk": 0, "branches": {}, "mods": set(), "test": 0, "peak": {}})
                d["names"].add(c["an"]); d["commits"] += 1; d["ins"] += c["ins"]; d["del"] += c["del"]
                ds = str(c["dt"].date()); d["days"].add(ds); d["peak"][ds] = d["peak"].get(ds, 0) + 1
                if c["dt"].hour >= 22 or c["dt"].hour < 6: d["late"] += 1
                if c["dt"].date().weekday() >= 5: d["wk"] += 1
                for b in c["branches"]: d["branches"][b] = d["branches"].get(b, 0) + 1
                for (ai, di, fp) in c["files"]:
                    d["mods"].add("/".join(fp.replace("\\", "/").split("/")[:2]) or fp)
                if any(TEST_PAT.search(fp.replace("\\", "/")) for (ai, di, fp) in c["files"]): d["test"] += 1
            return p

        wp = personify(w_eff); sp = personify(s_eff)
        members = [{"name": disp(d["an"], d["ae"]), "commits": d["commits"], "insertions": d["ins"], "deletions": d["del"],
                    "branches": d["branches"], "activeDays": len(d["days"]), "deepNight": d["late"], "weekend": d["wk"],
                    "peakDay": max(d["peak"].items(), key=lambda x: x[1])[0][5:] if d["peak"] else None,
                    "peakN": max(d["peak"].values()) if d["peak"] else 0,
                    "modulesTouched": len(d["mods"]), "testCommits": d["test"]}
                   for k, d in sorted(wp.items(), key=lambda x: -x[1]["commits"])]
        pp_map = {x["name"]: x for x in L.get("peopleProfile", [])}
        peopleProfile = []
        for k, d in sorted(sp.items(), key=lambda x: -x[1]["commits"]):
            nm = disp(d["an"], d["ae"]); base = pp_map.get(nm, {})
            peopleProfile.append({"name": nm, "role": base.get("role", ""), "intent": base.get("intent", ""),
                                  "workload": base.get("workload", ""), "intensity": base.get("intensity", ""),
                                  "engagement": base.get("engagement", ""), "risk": base.get("risk", ""),
                                  "riskLevel": base.get("riskLevel"), "activeDays": len(d["days"]), "deepNight": d["late"],
                                  "weekend": d["wk"], "peakDay": max(d["peak"].items(), key=lambda x: x[1])[0][5:] if d["peak"] else None,
                                  "peakN": max(d["peak"].values()) if d["peak"] else 0, "modulesTouched": len(d["mods"]),
                                  "testCommits": d["test"], "share": round(d["commits"] / len(s_eff), 2) if s_eff else 0})
        branches = [{"name": b["name"], "ahead": b.get("ahead"), "behind": b.get("behind"),
                     "staleDays": b.get("staleDays"), "lastActive": b.get("lastActive")}
                    for b in R.get("branchPos", []) if "error" not in b]
        err_br = [f"{b['name']}: {b['error']}" for b in R.get("branchPos", []) if "error" in b]
        q = R.get("quality", {})
        w_ins = sum(c["ins"] for c in w_eff); w_del = sum(c["del"] for c in w_eff)
        classification = {k: 0 for k in CLS}
        for c in w_eff: classification[cls_of(c["s"])] += 1
        trivial = [{"h": c["h"], "s": c["s"][:60], "lines": c["ins"] + c["del"]} for c in w_eff if c["ins"] + c["del"] <= 3]
        big = [{"h": c["h"], "s": c["s"][:60], "files": len(c["files"]), "churn": c["ins"] + c["del"]}
               for c in w_eff if len(c["files"]) > 15 or c["ins"] + c["del"] > 800]
        mmod = {}
        for c in w_eff:
            for (ai, di, fp) in c["files"]:
                m = "/".join(fp.replace("\\", "/").split("/")[:2]) or fp
                e = mmod.setdefault(m, {"insertions": 0, "deletions": 0, "commits": set()})
                e["insertions"] += ai; e["deletions"] += di; e["commits"].add(c["h"])
        mdesc = L.get("moduleDesc", {})
        moduleActivity = [{"module": m, "desc": mdesc.get(m, ""), "insertions": v["insertions"], "deletions": v["deletions"],
                           "commits": len(v["commits"]), "core": m in L.get("coreModules", [])}
                          for m, v in sorted(mmod.items(), key=lambda x: -(x[1]["insertions"] + x[1]["deletions"]))][:8]
        daily = collections.Counter(str(c["dt"].date()) for c in s_rows)
        rhythm = []
        d0 = stats_start
        while d0 <= today:
            rhythm.append({"date": d0.strftime("%m-%d"), "commits": daily.get(str(d0), 0)})
            d0 += datetime.timedelta(days=1)
        weekly = [{"label": w["label"][5:], "commits": w["commits"], "effective": w["effective"], "authors": w["authors"],
                   "insertions": w["ins"], "deletions": w["del"]} for w in R.get("weekly", [])]
        dd_proj = lit["dayDiff"]; prevday = dd_proj["prevDay"]
        dD = R.get("dayDetail", {})
        td = dD.get(str(today), {}); pd_ = dD.get(prevday, {})
        tset = set(td.get("authors", [])); pset = set(pd_.get("authors", []))
        nm_of = {}
        for c in commits.values(): nm_of[c["key"]] = disp(c["an"], c["ae"])
        newA = [nm_of[k] for k in sorted(tset - pset) if k in nm_of]
        goneA = [nm_of[k] for k in sorted(pset - tset) if k in nm_of]
        dayDiff = {"todayCommits": td.get("commits", 0), "todayEffective": td.get("effective", 0),
                   "todayIns": td.get("ins", 0), "todayDel": td.get("del", 0),
                   "prevDayCommits": pd_.get("commits", 0), "prevDayEffective": pd_.get("effective", 0),
                   "prevDayIns": pd_.get("ins", 0), "prevDayDel": pd_.get("del", 0),
                   "newAuthors": newA, "goneAuthors": goneA,
                   "aheadDelta": L.get("aheadDelta", {}).get(name, "0"), "note": L.get("dayDiffNote", {}).get(name, "")}
        total = L["total"]; scores = L["scores"]
        snap = {"period": lit["period"], "at": run_at[11:16], "commits": len(w_rows), "effective": len(w_eff),
                "ins": w_ins, "del": w_del, "authors": len({c["key"] for c in w_eff}), "big": len(big),
                "todos": q.get("todoTotal"), "scores": scores, "total": total, "level": level_of(total), "topRisk": L["topRisk"]}
        pv = prev_by_name.get(name, {})
        prev_block = None
        if pv:
            prev_block = {"total": pv.get("total"), "dailyAvg": (pv.get("prev") or {}).get("dailyAvg"),
                          "scores": pv.get("scores"),
                          "members": [{"name": m.get("name"), "commits": m.get("commits")} for m in pv.get("members", [])],
                          "branches": [{"name": b.get("name"), "ahead": b.get("ahead"), "behind": b.get("behind")} for b in pv.get("branches", [])],
                          "quality": pv.get("quality")}
        eff_n = len(w_eff)
        tcomm = sum(1 for c in w_eff if cls_of(c["s"]) == "test")
        sync = sum(1 for c in w_eff if any(TEST_PAT.search(fp.replace("\\", "/")) for (ai, di, fp) in c["files"]))
        tins = sum(ai for c in w_eff for (ai, di, fp) in c["files"] if TEST_PAT.search(fp.replace("\\", "/")))
        tdel = sum(di for c in w_eff for (ai, di, fp) in c["files"] if TEST_PAT.search(fp.replace("\\", "/")))
        LT = L.get("testing", {})
        testing = {"testCommitShare": round(tcomm / eff_n, 2) if eff_n else 0,
                   "syncRate": round(sync / eff_n, 2) if eff_n else 0, "syncDenom": eff_n,
                   "testRatio": round((tins + tdel) / (w_ins + w_del), 2) if (w_ins + w_del) else 0,
                   "stockTestFiles": q.get("stockTestFiles", 0), "stockNote": LT.get("stockNote", ""),
                   "sitTraces": LT.get("sitTraces", 0), "aiReview": LT.get("aiReview", "")}
        lifetime = R.get("lifetime", {})
        monthly = [{"month": m, "commits": lifetime.get("monthly", {}).get(m, 0)} for m in sorted(lifetime.get("monthly", {}))]
        entry = {"name": name, "total": total, "level": level_of(total),
                 "delta": round(total - pv["total"], 1) if pv and pv.get("total") is not None else None,
                 "scores": scores, "topRisk": L["topRisk"], "narrative": L["narrative"], "testing": testing,
                 "members": members, "branches": branches,
                 "quality": {"todo": q.get("todoTotal"), "todoThreshold": 20, "bigCommits": len(big),
                             "reworkRatio": round(w_del / w_ins, 2) if w_ins else 0, "reworkThreshold": 0.5,
                             "largeFiles": len(q.get("largeFiles", []))},
                 "rhythm": rhythm, "weekly": weekly, "moduleActivity": moduleActivity, "peopleProfile": peopleProfile,
                 "plans": L.get("plans", []), "risks": L.get("risks", []), "dayDiff": dayDiff, "roundDiff": None,
                 "roundSnapshots": [snap],
                 "windowAnalysis": {"classification": classification, "merges": sum(1 for c in w_rows if c["merge"]),
                                    "effectiveCommits": eff_n, "trivial": trivial},
                 "lifetime": {"first": lifetime.get("first"), "last": lifetime.get("last"),
                              "totalCommits": lifetime.get("totalCommits"), "authors": lifetime.get("authors"),
                              "monthly": monthly,
                              "topAuthors": [{"key": x.get("key"), "commits": x.get("commits")} for x in lifetime.get("topAuthors", [])]},
                 "insights": L.get("insights", []), "prev": prev_block}
        if err_br: entry["_branchErrors"] = err_br
        repos_out.append(entry)

    # saturationTrend：W1..W(n-1) 沿用上期发布值，末窗跨仓重算（§5.4.9）
    st_prev = prev.get("saturationTrend", {})
    team_prev = st_prev.get("team", [])
    sat = {"scope": "统计期各 7 天窗口", "unit": "窗口", "team": [], "people": []}
    last_label = None
    if lw:
        last_label = f"{lw['start'][5:]}~{lw['end'][5:]}"
        members_n = len(st_prev.get("people", [])) or len(proj_lw) or 1
        wd = lw["workdays"]
        tot_eff = sum(e["eff"] for e in proj_lw.values())
        sum_days = sum(len(e["days"]) for e in proj_lw.values())
        cov = sum_days / (wd * members_n) if wd else 0
        nonwork = sum(e["nonwork"] for e in proj_lw.values())
        nw_share = nonwork / tot_eff if tot_eff else 0
        loadLv = 2 if (cov >= 0.5 and nw_share >= 0.10) else (1 if (cov >= 0.3 or nw_share >= 0.05) else 0)
        effs = sorted((e["eff"] for e in proj_lw.values()), reverse=True)
        top3 = (sum(effs[:3]) / tot_eff) if tot_eff else 0
        focus = 2 if (tot_eff and top3 >= 0.8) else (1 if (tot_eff and top3 >= 0.6) else 0)
        if not tot_eff: loadLv = focus = 0
        new_win = {"period": len(team_prev), "label": last_label, "load": loadLv, "focus": focus, "composite": loadLv + focus,
                   "loadLevel": ["低", "中", "高"][loadLv], "focusLevel": ["低", "中", "高"][focus]}
        # 末窗衔接：同窗扩展（起点一致）→ 替换上期末窗；新窗跨越（起点后移）→ 上期末窗已完整，保留并追加
        prev_last_start = team_prev[-1]["label"].split("~")[0] if team_prev else None
        same_win = (last_label.split("~")[0] == prev_last_start) or not team_prev
        if same_win:
            # 同窗扩展（或首期）：替换上期末窗
            base_team, new_period = list(team_prev[:-1]), len(team_prev)
        else:
            # 新窗跨越：上期末窗已完整，保留并追加
            base_team, new_period = list(team_prev), len(team_prev) + 1
        sat["team"] = base_team + [{**new_win, "period": new_period}]
        lv = {}
        for k, e in proj_lw.items():
            cov1 = len(e["days"]) / wd if wd else 0
            deff = e["eff"] / len(e["days"]) if e["days"] else 0
            dln = (e["ins"] + e["del"]) / len(e["days"]) if e["days"] else 0
            lv[k] = person_level(cov1, deff, dln)
        nm_of = {k: disp(e["an"], e["ae"]) for k, e in proj_lw.items()}
        for ppl in st_prev.get("people", []):
            nm = ppl["name"]; lvl, lvlname = lv.get(next((k for k in nm_of if nm_of[k] == nm), None), (0, "低"))
            kept = ppl["points"] if not same_win else ppl["points"][:-1]
            pts = list(kept) + [{"period": new_period, "label": last_label, "level": lvl,
                                 "levelName": lvlname, "note": ""}]
            sat["people"].append({"name": nm, "points": pts})
        known = {p["name"] for p in sat["people"]}
        for k, e in proj_lw.items():
            nm = nm_of[k]
            if nm not in known:
                lvl, lvlname = lv[k]
                sat["people"].append({"name": nm, "points":
                    [{"period": i + 1, "label": t["label"], "level": 0, "levelName": "低", "note": "本窗口前统计期未活跃"}
                     for i, t in enumerate(base_team)] +
                    [{"period": new_period, "label": last_label, "level": lvl, "levelName": lvlname, "note": ""}]})
    pm = prev.get("meta", {})
    meta = {"project": proj, "date": str(today), "period": lit["period"], "window": f"{win_start} ~ {today}",
            "runAt": run_at, "statsRange": f"{stats_start} ~ {today}", "repoCount": len(repos_out), "template": 19,
            "planRange": lit.get("planRange") or pm.get("planRange"),
            "prev": {"date": pm.get("date"), "period": pm.get("period"), "label": f"{pm.get('date','')[5:]} P{pm.get('period')}"} if pm.get("period") else None,
            "dayDiff": {"prevDay": lit["dayDiff"]["prevDay"][5:], "today": str(today)[5:],
                        "todayAsOf": f"截至 {run_at[11:16]}（非整日）", "gapDays": lit["dayDiff"]["gapDays"],
                        "skipped": lit["dayDiff"].get("skipped", ""),
                        "docsChangedToday": lit["dayDiff"].get("docsChangedToday", False),
                        "docsSummary": lit["dayDiff"].get("docsSummary", ""), "headline": lit["dayDiff"].get("headline", "")},
            "roundDiff": {"roundNo": 1, "roundsToday": 1, "prevRoundAt": None, "headline": "今日首轮（第 1/1 轮），无轮内增量可对比"},
            "roundChain": {"rounds": [{"period": lit["period"], "at": run_at[11:16], "roundNo": 1}]}}
    history = list(prev.get("history", []))
    history.append({"label": f"{str(today)[5:]} P{lit['period']}",
                    "repos": {r["name"]: {"total": r["total"]} for r in repos_out}, "note": lit.get("historyNote", "")})
    data = {"meta": meta, "headline": lit["headline"], "keyPoints": lit["keyPoints"], "repos": repos_out,
            "saturationTrend": sat, "history": history}
    outp = os.path.join(rundir, "data.json")
    with io.open(outp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"[build] {proj}: data.json OK; repos={len(repos_out)}; teamWin={len(sat['team'])} last={last_label}")
    for r in repos_out:
        print(f"  {r['name']}: {r['total']}({r['level']}) d={r['delta']} m={len(r['members'])} risks={len(r['risks'])} plans={len(r['plans'])} brErr={r.get('_branchErrors')}")

if __name__ == "__main__":
    main()
