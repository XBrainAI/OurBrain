# -*- coding: utf-8 -*-
"""紧凑摘要：agg.json 窗口/分支/质量/日明细 + prev REPORT_DATA 基线（分析辅助，不做判定）"""
import json, sys, io
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
proj, run = sys.argv[1], sys.argv[2]
agg = json.load(io.open(f"reports/{proj}/{run}/_evidence/agg.json", encoding="utf-8"))
prev = json.load(io.open(f"reports/{proj}/{run}/_evidence/prev_report_data.json", encoding="utf-8"))
W = lambda c: (c or 0)
print(f"### {proj} agg (run {agg['meta']['runAt']}, win {agg['meta']['windowStart']}~{agg['meta']['windowEnd']})")
for R in agg["repos"]:
    w = R.get("window", {})
    print(f"\n== {R['name']} (检出:{R.get('checkedOut')}, 有远端:{R.get('hasRemote')})")
    print(f"  窗口: total={w.get('total')} eff={w.get('effective')} merge={w.get('merge')} ins={w.get('ins')} del={w.get('del')} authors={w.get('authors')} big={len(w.get('big',[]))} trivial={len(w.get('trivial',[]))}")
    print(f"  分类: {w.get('classification')}")
    if w.get("shortMsgs"): print(f"  短msg: {[(x['h'],x['s'][:20]) for x in w['shortMsgs']][:8]}")
    for k,v in sorted(w.get("persons",{}).items(), key=lambda x:-x[1]["commits"]):
        print(f"  成员 {v['names']}/{k}: eff={v['commits']} +{v['ins']}/-{v['del']} 天={v['activeDays']} 深夜={v['lateNight']} 周末={v['weekend']} 分支={v['branches']} 测={v['testCommits']} peak={v['peakDay']}x{v['peakN']}")
    for b in w.get("big",[]): print(f"  大提交 {b['h']} {b['files']}f {b['churn']}行 {b['s']}")
    for t in w.get("trivial",[])[:5]: print(f"  碎提交 {t['h']} {t['lines']}行 {t['s'][:30]}")
    for b in R.get("branchPos",[]):
        if "error" in b: print(f"  分支 {b['name']}: {b['error']}"); continue
        print(f"  分支 {b['name']}: ahead={b['ahead']} behind={b['behind']} fork={b.get('forkDate')} stale={b.get('staleDays')}d last={b.get('lastActive')}")
    mb = R.get("mainBranch",{}); q = R.get("quality",{})
    print(f"  主干 {mb.get('branch')}: last={mb.get('lastActive')}; TODO={q.get('todoTotal')} 大文件={len(q.get('largeFiles',[]))} 测试文件={q.get('stockTestFiles')} 文件数={q.get('trackedFiles')} 模式={q.get('mode','')[:40]}")
    if q.get("largeFiles"): print(f"    大文件: {[(x['path'][-40:],x['lines']) for x in q['largeFiles']]}")
    lt = R.get("lifetime",{})
    print(f"  生命周期: {lt.get('first')}~{lt.get('last')} total={lt.get('totalCommits')} authors={lt.get('authors')} top={[(x['key'],x['commits']) for x in lt.get('topAuthors',[])]}")
    print(f"  今日: {R['today'].get('total')} commits; 上一变动日候选={R.get('lastCommitDayBeforeToday')}")
    dd = R.get("dayDetail",{}); 
    for d in sorted(dd)[-4:]: print(f"    {d}: c={dd[d]['commits']} e={dd[d]['effective']} +{dd[d]['ins']}/-{dd[d]['del']} a={dd[d]['authors']}")
    sw = R.get("saturationWindows",[])
    if sw:
        lw = sw[-1]; lw2 = sw[-2] if len(sw)>1 else {}
        print(f"  饱和末窗 {lw['start']}~{lw['end']} (wd{lw['workdays']}): {[(k,v['names'][0] if v['names'] else k,v['effective'],v['activeDays']) for k,v in lw['persons'].items()]}")
        if lw2: print(f"  饱和前窗 {lw2['start']}~{lw2['end']} (wd{lw2['workdays']}): {[(k,v['names'][0] if v['names'] else k,v['effective'],v['activeDays']) for k,v in lw2['persons'].items()]}")
    wk = R.get("weekly",[]); print(f"  周尾: {[(x['label'],x['commits'],x['effective'],x['authors']) for x in wk[-4:]]}")
    mods = {}
    for c in w.get("commits",[]): pass
dm = agg.get("docsMtime",{})
print(f"\n  项目文档mtimes: {[(x['path'].split('/')[-1],x['date']) for x in dm.get('project',[])[:5]]}")
print(f"  全局文档mtimes: {[(x['path'].split('/')[-1],x['date']) for x in dm.get('global',[])[:5]]}")
print(f"\n### PREV {proj}: period={prev['meta'].get('period')} runAt={prev['meta'].get('runAt')} window={prev['meta'].get('window')} statsRange={prev['meta'].get('statsRange')}")
print(f"  headline: {prev.get('headline')}")
print(f"  keyPoints: {[k['text'][:50] for k in prev.get('keyPoints',[])]}")
for r in prev.get("repos",[]):
    print(f"  {r['name']}: total={r.get('total')} level={r.get('level')} delta={r.get('delta')} scores={r.get('scores')}")
    print(f"    topRisk: {r.get('topRisk')}")
    print(f"    risks(age): {[(x['title'][:40],x.get('agePeriods')) for x in r.get('risks',[])]}")
    print(f"    plans: {[(p['id'],p['status'],p.get('prevStatus'),p.get('done')) for p in r.get('plans',[])]}")
    print(f"    members: {[(m['name'],m['commits']) for m in r.get('members',[])]}")
    print(f"    prev: total={r.get('prev',{}).get('total') if r.get('prev') else None}")
st = prev.get("saturationTrend",{})
print(f"  饱和Trend team: {[(t['label'],t.get('load'),t.get('focus'),t.get('composite'),t.get('loadLevel'),t.get('focusLevel')) for t in st.get('team',[])]}")
for p in st.get("people",[])[:8]: print(f"    {p['name']}: {[(x['label'],x['level']) for x in p['points']][-4:]}")
print(f"  history: {[(h['label'], list(h.get('repos',{}).values())) for h in prev.get('history',[])]}")
