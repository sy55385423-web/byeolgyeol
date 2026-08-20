/** 능력 프로파일의 기준분포를 잰다(6층).
 *
 *  RECIPES나 features.ts를 고치면 반드시 다시 돌려서 lib/core/profile.ts의
 *  COMPOSITE_NORM과 ABILITY_DECILES를 갱신할 것.
 *
 *  지금은 모의 명반 표본으로 만든 이론값이다. 실제 사용자 데이터가 쌓이면
 *  같은 형식으로 갈아 끼우면 된다(Theory Mode → Empirical Mode). */
import { buildProfile } from "../lib/core/profile.ts";
import { computeChart } from "../lib/saju.ts";
import { analyzeTiming } from "../lib/timing.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1940+(i*3)%85,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(300);
const dec=v=>{v.sort((a,b)=>a-b);return [1,2,3,4,5,6,7,8,9].map(q=>Math.round(v[Math.floor(v.length*q/10)]*10)/10);};
const out={norm:{},ability:{}};
for(const set of ["love","career","wealth"]){
  const comp=[], cols=[[],[],[],[],[]];
  for(const p of P){
    const A=analyzeTiming(computeChart(p)).analysis;
    const pr=buildProfile(A,set);
    comp.push(pr.compositeRaw);
    pr.abilities.forEach((x,k)=>cols[k].push(x.rawScore ?? x.score));
  }
  const m=comp.reduce((s,v)=>s+v,0)/comp.length;
  const sd=Math.sqrt(comp.reduce((s,v)=>s+(v-m)**2,0)/comp.length);
  out.norm[set]={mean:Math.round(m*10)/10, sd:Math.round(sd*10)/10, deciles:dec([...comp])};
  out.ability[set]=cols.map(dec);
}
console.log(JSON.stringify(out));
