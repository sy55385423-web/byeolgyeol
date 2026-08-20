/** 레이더 5축이 명식에서 나오는가.
 *
 *  예전에는 seed 해시였다. "신뢰감 78"이 무엇에서 나온 값인지 설명할 수 없었다.
 *  지금은 십신 갈래·강약·오행 무게로 잰다. 두 가지를 본다.
 *   (1) 명식이 같은 사실을 가리키면 값도 같은가 (근거가 있다는 뜻)
 *   (2) 한 값으로 고정되거나 극단으로 쏠리지 않는가 */
import { radarStats } from "../lib/report.ts";
import { computeChart } from "../lib/saju.ts";
import { analyzeTiming } from "../lib/timing.ts";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1950+(i*7)%70,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(200);
for(const c of categories){
  const cols=[[],[],[],[],[]]; let labels=[];
  for(const [i,p] of P.entries()){
    const me=computeChart(p), pt=c.needsPartner?computeChart(P[(i+37)%P.length]):undefined;
    const r=radarStats({me,pt,c,input:{me:p},tier:"basic"});
    labels=r.axes.map(a=>a.label);
    r.axes.forEach((a,k)=>cols[k].push(a.value));
  }
  const out=cols.map((v,k)=>{
    const u=new Set(v).size, mn=Math.min(...v), mx=Math.max(...v);
    const avg=Math.round(v.reduce((a,b)=>a+b,0)/v.length);
    return `${labels[k]} ${u}종/${mn}~${mx}·평균${avg}${u<=1?" ◀고정":""}`;
  });
  console.log(`${c.id.padEnd(19)} ${out.join(" · ")}`);
}
