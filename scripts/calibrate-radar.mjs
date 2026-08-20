/** 레이더 축의 원점수 분포를 재서 백분위 기준점(9분위)을 뽑는다. */
import { computeChart } from "../lib/saju.ts";
import { analyzeTiming } from "../lib/timing.ts";
import { values } from "../lib/report.ts";
import { categories } from "../data/categories.ts";
import { STEM_EL as SE, BRANCH_EL as BE, branchSix as bSix, branchClash as bCl } from "../lib/core/ganji.ts";
const src=await import("../lib/report.ts");
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1940+(i*3)%85,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(400);
// AXIS_FN 은 export 되지 않으므로 radarStats 를 임시로 원점수 모드로 돌릴 수 없다.
// 대신 같은 식을 여기서 다시 계산한다 — 값이 어긋나면 아래 검사기가 잡는다.
const gS=v=>30+v*15, cS=(n,b=40,st=13)=>b+n*st;
// lib/report.ts 의 pillarScore 와 같은 식이어야 한다
const tp=w=>w<=3?w:3+(w-3)*0.35;
const cap=c=>Math.max(0.3,Math.min(1.3,c.str/50));
const pS=(c,p)=>{if(!p)return 55;let n=0;for(const el of p){if(el===c.use)n+=2;else if(el===c.help)n+=1;else if(el===c.avoid)n-=2;}return 55+n*9;};
const F={
 "love-life":[c=>gS(tp(c.g.식상+c.g.재성*0.6)*cap(c))+(c.sin.includes("도화")?6:0),c=>gS(tp(c.g.식상)*1.3*cap(c)),c=>55+(c.g.식상+c.g.비겁*0.6-c.g.인성-c.g.관성*0.8)*9,c=>cS(c.gods.filter(x=>x==="정관"||x==="정재").length,45,12)*(0.65+0.35*cap(c))+(c.g.관성+c.g.재성)*3,c=>gS(tp(c.g.관성)*1.2*(0.6+0.4*cap(c)))],
 "love-compatibility":[c=>(c.ps??55)*0.9+gS(c.g.식상)*0.1,c=>cS(c.gods.filter(x=>x==="정관"||x==="정재").length,42,12)*(0.65+0.35*cap(c))+(c.g.관성+c.g.재성)*3,c=>pS(c,c.pel.시)*0.7+gS(c.g.식상)*0.3,c=>(c.ps??55)*0.5+(c.strong?60:45)*0.5,c=>cS(c.gods.filter(x=>x==="편관"||x==="편재").length,40,13)+(c.sin.includes("도화")?8:0)+c.g.식상*3],
 "love-reunion":[c=>gS(c.g.인성+c.g.비겁*0.5)+(c.six?14:0)-(c.clash?12:0),c=>gS(tp(c.g.식상)*1.2*cap(c)),c=>c.str*0.7+gS(c.g.관성)*0.3,c=>(c.ps??50)*0.8+20,c=>c.str*0.6+gS(c.g.비겁)*0.4],
 career:[c=>gS(tp(c.g.관성+c.g.비겁*0.4)*cap(c)),c=>gS(tp(c.g.인성)*1.2),c=>gS(tp(c.g.식상)*cap(c))+(c.sin.includes("역마")?6:0),c=>cS(c.gods.filter(x=>x==="정관"||x==="정인").length,42,12)+(c.g.관성+c.g.인성)*3,c=>gS(c.g.재성)*0.5+c.str*0.5],
 wealth:[c=>cS(c.gods.filter(x=>x==="정재").length,42,15)+c.g.재성*6+(c.strong?6:0),c=>cS(c.gods.filter(x=>x==="편재").length,40,15)+(c.g.재성*4+c.g.식상*4)*cap(c),c=>90-c.g.비겁*14,c=>gS((c.g.식상+c.g.재성*0.5)*cap(c)),c=>gS(tp(c.g.재성))*0.6+c.str*0.4],
 health:[c=>c.str*0.8+15,c=>c.str*0.5+gS(c.g.인성)*0.5,c=>92-Math.abs(c.el[c.avoid]-c.el[c.use])*12,c=>92-c.g.관성*12,c=>cS(c.gods.filter(x=>x==="정관"||x==="정인"||x==="정재").length,40,11)+c.g.인성*4+(c.strong?5:0)],
 "life-overview":[c=>c.str*0.6+gS(c.g.비겁)*0.4,c=>pS(c,c.pel.년)*0.7+gS(c.g.인성)*0.3,c=>pS(c,c.pel.일)*0.6+gS(c.g.재성+c.g.관성*0.5)*0.4,c=>gS(tp(c.g.식상)*cap(c)+c.g.인성*0.4),c=>gS(c.g.식상)*0.5+c.str*0.5],
};
const out={};
for(const c of categories){
  const cols=[[],[],[],[],[]];
  for(const [i,p] of P.entries()){
    const me=computeChart(p), A=analyzeTiming(me).analysis;
    const pt=c.needsPartner?computeChart(P[(i+37)%P.length]):undefined;
    const ctx={g:A.groupWeight,el:A.elementWeight,strong:A.strong,str:A.strengthScore,
      gods:A.tenGods.flatMap(t=>[t.stem,t.branch]),sin:A.sinsal.map(x=>x.name),
      ps:pt?Number(values({me,pt,c,input:{me:p},tier:"basic"})["궁합 총점수"]?.v ?? values({me,pt,c,input:{me:p},tier:"basic"})["재회 가능성"]?.v ?? 55):undefined,
      use:A.useEl,help:A.helpEl,avoid:A.avoidEl,
      pel:{년:[SE[A.pillars.년.stem],BE[A.pillars.년.branch]],월:[SE[A.pillars.월.stem],BE[A.pillars.월.branch]],
           일:[SE[A.pillars.일.stem],BE[A.pillars.일.branch]],시:A.pillars.시?[SE[A.pillars.시.stem],BE[A.pillars.시.branch]]:null},
      six:pt?bSix(A.pillars.일.branch,analyzeTiming(pt).analysis.pillars.일.branch):undefined,
      clash:pt?bCl(A.pillars.일.branch,analyzeTiming(pt).analysis.pillars.일.branch):undefined};
    F[c.id].forEach((f,k)=>cols[k].push(f(ctx)));
  }
  out[c.id]=cols.map(v=>{v.sort((a,b)=>a-b);return [1,2,3,4,5,6,7,8,9].map(q=>Math.round(v[Math.floor(v.length*q/10)]*10)/10);});
}
console.log(JSON.stringify(out));
