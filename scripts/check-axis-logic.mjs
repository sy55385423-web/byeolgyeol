/** 축 계산이 명리 원리를 따르는가 — 대조 검증.
 *
 *  같은 십신 무게라도 일간이 감당하느냐에 따라 해석이 뒤집혀야 한다(억부).
 *  넘치는 것도 부족한 것만큼 문제여야 한다(태과불급).
 *  이 두 가지가 실제로 값에 반영되는지 짝을 지어 확인한다. */
import { radarStats } from "../lib/report.ts";
import { computeChart } from "../lib/saju.ts";
import { analyzeTiming } from "../lib/timing.ts";
import { categories } from "../data/categories.ts";
const c=categories.find(x=>x.id==="love-life");
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1940+(i*3)%85,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const rows=mk(500).map(p=>{
  const me=computeChart(p), A=analyzeTiming(me).analysis;
  const r=radarStats({me,c,input:{me:p},tier:"basic"});
  return {g:A.groupWeight, str:A.strengthScore, ax:Object.fromEntries(r.axes.map(a=>[a.label,a.value]))};
});
const avg=(a,k)=>a.length?Math.round(a.reduce((s,x)=>s+x.ax[k],0)/a.length):0;
// 1) 억부 — 식상이 비슷하게 많은데 신강 vs 신약
const hiSik=rows.filter(r=>r.g.식상>=2.5);
const strong=hiSik.filter(r=>r.str>=55), weak=hiSik.filter(r=>r.str<35);
console.log(`억부 검증 — 식상 2.5 이상인 사람 ${hiSik.length}명`);
console.log(`  신강(${strong.length}명) 감정표현 ${avg(strong,"감정표현")} · 사교성 ${avg(strong,"사교성")}`);
console.log(`  신약(${weak.length}명) 감정표현 ${avg(weak,"감정표현")} · 사교성 ${avg(weak,"사교성")}`);
console.log(`  → 신강이 ${avg(strong,"감정표현")-avg(weak,"감정표현")}점 높음 ${avg(strong,"감정표현")>avg(weak,"감정표현")?"✓":"◀ 원리와 반대"}`);
// 2) 태과불급 — 관성 적당 vs 과다
const mid=rows.filter(r=>r.g.관성>=1.5&&r.g.관성<=2.5);
const overS=rows.filter(r=>r.g.관성>=3.5&&r.str>=45), overW=rows.filter(r=>r.g.관성>=3.5&&r.str<45);
console.log(`\n태과불급 검증 — 책임감(관성). 관살이 과해도 감당 여부로 갈려야 한다`);
console.log(`  적당(1.5~2.5, ${mid.length}명) ${avg(mid,"책임감")}`);
console.log(`  과다+감당가능(${overS.length}명) ${avg(overS,"책임감")} · 과다+감당불가(${overW.length}명) ${avg(overW,"책임감")}`);
console.log(`  → 감당 못 하는 쪽이 낮아야 한다 ${avg(overW,"책임감")<avg(overS,"책임감")?"✓":"◀ 원리와 반대"}`);
// 3) 독립성 — 인성 많은 사람 vs 적은 사람
const hiIn=rows.filter(r=>r.g.인성>=2.5), loIn=rows.filter(r=>r.g.인성<0.8);
console.log(`\n독립성 검증 — 인성은 남이 나를 돌보는 자리`);
console.log(`  인성 많음(${hiIn.length}명) ${avg(hiIn,"독립성")} · 인성 적음(${loIn.length}명) ${avg(loIn,"독립성")}`);
console.log(`  → 인성 적은 쪽이 높아야 한다 ${avg(loIn,"독립성")>avg(hiIn,"독립성")?"✓":"◀ 원리와 반대"}`);
