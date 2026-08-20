/** 레이더 축의 원점수 분포를 재서 백분위 기준점(9분위)을 뽑는다. */
import { computeChart } from "../lib/saju.ts";
import { analyzeTiming } from "../lib/timing.ts";
import { values } from "../lib/report.ts";
import { categories } from "../data/categories.ts";
const src=await import("../lib/report.ts");
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1940+(i*3)%85,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(400);
// AXIS_FN 은 export 되지 않으므로 radarStats 를 임시로 원점수 모드로 돌릴 수 없다.
// 대신 같은 식을 여기서 다시 계산한다 — 값이 어긋나면 아래 검사기가 잡는다.
const gS=v=>30+v*15, cS=(n,b=40,st=13)=>b+n*st;
const F={
 "love-life":[c=>gS(c.g.식상+c.g.재성*0.6)+(c.sin.includes("도화")?8:0),c=>gS(c.g.식상*1.3),c=>gS(c.g.비겁)*0.5+c.str*0.5,c=>cS(c.gods.filter(x=>x==="정관"||x==="정재").length,45,12)+(c.g.관성+c.g.재성)*3,c=>gS(c.g.관성*1.2)],
 "love-compatibility":[c=>(c.ps??55)*0.9+gS(c.g.식상)*0.1,c=>cS(c.gods.filter(x=>x==="정관"||x==="정재").length,42,12)+(c.g.관성+c.g.재성)*3,c=>gS(c.g.식상+c.g.인성*0.4),c=>(c.ps??55)*0.5+(c.strong?60:45)*0.5,c=>cS(c.gods.filter(x=>x==="편관"||x==="편재").length,40,13)+(c.sin.includes("도화")?8:0)+c.g.식상*3],
 "love-reunion":[c=>gS(c.g.인성+c.g.비겁*0.5),c=>gS(c.g.식상*1.2),c=>c.str*0.7+gS(c.g.관성)*0.3,c=>(c.ps??50)*0.8+20,c=>c.str*0.6+gS(c.g.비겁)*0.4],
 career:[c=>gS(c.g.관성+c.g.비겁*0.4),c=>gS(c.g.인성*1.2),c=>gS(c.g.식상)+(c.sin.includes("역마")?8:0),c=>cS(c.gods.filter(x=>x==="정관"||x==="정인").length,42,12)+(c.g.관성+c.g.인성)*3,c=>gS(c.g.재성)*0.5+c.str*0.5],
 wealth:[c=>cS(c.gods.filter(x=>x==="정재").length,42,15)+c.g.재성*6+(c.strong?6:0),c=>cS(c.gods.filter(x=>x==="편재").length,40,15)+c.g.재성*4+c.g.식상*4,c=>90-c.g.비겁*14,c=>gS(c.g.식상+c.g.재성*0.5),c=>gS(c.g.재성)*0.6+c.str*0.4],
 health:[c=>c.str*0.8+15,c=>c.str*0.5+gS(c.g.인성)*0.5,c=>92-Math.abs(c.el[c.avoid]-c.el[c.use])*12,c=>92-c.g.관성*12,c=>cS(c.gods.filter(x=>x==="정관"||x==="정인"||x==="정재").length,40,11)+c.g.인성*4+(c.strong?5:0)],
 "life-overview":[c=>c.str*0.6+gS(c.g.비겁)*0.4,c=>gS(c.g.인성*1.1),c=>gS(c.g.재성+c.g.관성*0.5),c=>gS(c.g.식상+c.g.인성*0.4),c=>gS(c.g.식상)*0.5+c.str*0.5],
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
      use:A.useEl,avoid:A.avoidEl};
    F[c.id].forEach((f,k)=>cols[k].push(f(ctx)));
  }
  out[c.id]=cols.map(v=>{v.sort((a,b)=>a-b);return [1,2,3,4,5,6,7,8,9].map(q=>Math.round(v[Math.floor(v.length*q/10)]*10)/10);});
}
console.log(JSON.stringify(out));
