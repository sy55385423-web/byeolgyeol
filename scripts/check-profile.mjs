/** 능력 프로파일 엔진 검증.
 *
 *  1) 각 능력이 그 능력의 재료가 많은 사람에게서 높게 나오는가
 *  2) 잠재력과 발현력이 실제로 갈리는가 (감당력이 낮으면 발현이 눌려야 한다)
 *  3) 종합 점수와 백분위가 다른 값인가
 *  4) 다섯 능력이 고르게 퍼지는가 */
import { buildProfile } from "../lib/core/profile.ts";
import { computeChart } from "../lib/saju.ts";
import { analyzeTiming } from "../lib/timing.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1940+(i*3)%85,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const rows=mk(500).map(p=>{
  const A=analyzeTiming(computeChart(p)).analysis;
  const pr=buildProfile(A,"love");
  return {g:A.groupWeight, str:A.strengthScore, f:pr.features,
    ax:Object.fromEntries(pr.abilities.map(a=>[a.label,a])), comp:pr.composite, pct:pr.percentile};
});
const avg=(a,k,f=x=>x.ax[k].score)=>a.length?Math.round(a.reduce((s,x)=>s+f(x),0)/a.length):0;
const ok=b=>b?"✓":"◀ 원리와 반대";

console.log("1) 재료가 많으면 그 능력이 높은가");
for(const [feat,ability] of [["표현성","감정표현"],["대인접근성","사교성"],["자기주도","독립성"],["일관성","신뢰감"],["책임성","책임감"]]){
  const hi=rows.filter(r=>r.f[feat]>=60), lo=rows.filter(r=>r.f[feat]<35);
  console.log(`  ${feat} 높음(${hi.length}) ${avg(hi,ability)} · 낮음(${lo.length}) ${avg(lo,ability)}  ${ok(avg(hi,ability)>avg(lo,ability))}`);
}
console.log("\n2) 감당력이 낮으면 발현이 눌리는가 (잠재는 비슷한데 발현이 갈려야 한다)");
const hiP=rows.filter(r=>r.ax["감정표현"].potential>=50);
const s2=hiP.filter(r=>r.str>=55), w2=hiP.filter(r=>r.str<35);
console.log(`  잠재 50+ 중 신강(${s2.length}) 발현 ${avg(s2,"감정표현",x=>x.ax["감정표현"].expression)} · 신약(${w2.length}) ${avg(w2,"감정표현",x=>x.ax["감정표현"].expression)}  ${ok(avg(s2,"감정표현",x=>x.ax["감정표현"].expression)>avg(w2,"감정표현",x=>x.ax["감정표현"].expression))}`);
console.log("\n2-2) 감당 민감도 — 설기 계열 능력만 감당력에 눌려야 한다");
// ⚠️ 식상이 많으면 그 자체로 신약해진다(설기). 십신을 통제하지 않고 강약만
//    비교하면 "신약한 쪽이 식상이 많아서" 결과가 뒤집힌다. 식상 무게가
//    비슷한 사람끼리 묶어서 비교해야 감당력의 순수한 효과가 보인다.
const bandSik = rows.filter(r => r.g.식상 >= 1.5 && r.g.식상 <= 2.5);
const bS = bandSik.filter(r => r.str >= 50), bW = bandSik.filter(r => r.str < 40);
for (const [k, sens] of [["감정표현","민감 1.0"],["사교성","민감 1.0"],["독립성","둔감 0.3"],["신뢰감","중간 0.6"]]) {
  console.log(`  ${k.padEnd(5)}(${sens}) 식상 1.5~2.5 중 신강(${bS.length}) ${avg(bS,k)} · 신약(${bW.length}) ${avg(bW,k)} · 차이 ${avg(bS,k)-avg(bW,k)}점`);
}
console.log("  → 민감한 축(감정표현·사교성)은 차이가 크고, 둔감한 축(독립성)은 작아야 한다");

console.log("\n3) 종합 점수와 백분위가 다른 값인가");
const same=rows.filter(r=>r.comp===100-r.pct).length;
const comps=[...new Set(rows.map(r=>r.comp))].length, pcts=[...new Set(rows.map(r=>r.pct))].length;
console.log(`  종합 ${comps}종 · 백분위 ${pcts}종 · 100−백분위와 같은 경우 ${same}건  ${ok(same<rows.length*0.2)}`);
const cs=rows.map(r=>r.comp).sort((a,b)=>a-b);
console.log(`  종합 범위 ${cs[0]}~${cs[cs.length-1]} 중앙 ${cs[cs.length>>1]}`);
console.log("\n4) 다섯 능력의 분포");
for(const k of ["사교성","감정표현","독립성","신뢰감","책임감"]){
  const v=rows.map(r=>r.ax[k].score); const u=new Set(v).size;
  console.log(`  ${k.padEnd(5)} ${u}종 · ${Math.min(...v)}~${Math.max(...v)} · 평균 ${Math.round(v.reduce((s,x)=>s+x,0)/v.length)}`);
}
