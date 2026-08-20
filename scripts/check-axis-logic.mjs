/** 축 계산이 명리 원리를 따르는가 — 대조 검증.
 *
 *  5축은 십신 다섯 갈래 그대로다(비겁·식상·재성·관성·인성). 조합식이 없으므로
 *  "그 갈래가 무거우면 그 축이 높다"가 기본이고, 여기에 두 원리가 얹힌다.
 *    태과불급  넘치면 오히려 제 구실을 못 한다
 *    억부      설기 계열(식상·재성·관성)은 일간이 감당해야 쓸 수 있다
 *  짝을 지어 실제로 그렇게 나오는지 본다. */
import { radarStats } from "../lib/report.ts";
import { computeChart } from "../lib/saju.ts";
import { analyzeTiming } from "../lib/timing.ts";
import { categories } from "../data/categories.ts";
const c = categories.find((x) => x.id === "love-life");
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1940+(i*3)%85,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const rows = mk(500).map((p) => {
  const me = computeChart(p), A = analyzeTiming(me).analysis;
  const r = radarStats({ me, c, input: { me: p }, tier: "basic" });
  return { g: A.groupWeight, str: A.strengthScore, ax: Object.fromEntries(r.axes.map((a) => [a.label, a.value])) };
});
const avg = (a, k) => (a.length ? Math.round(a.reduce((s, x) => s + x.ax[k], 0) / a.length) : 0);
const ok = (b) => (b ? "✓" : "◀ 원리와 반대");

// 1) 갈래가 무거우면 그 축이 높은가
console.log("십신 무게 → 축 값");
for (const [god, axis] of [["비겁","자기 주장"],["식상","표현력"],["재성","현실 감각"],["관성","책임감"],["인성","받아주는 힘"]]) {
  const hi = rows.filter((r) => r.g[god] >= 2), lo = rows.filter((r) => r.g[god] < 0.8);
  console.log(`  ${god} 많음(${hi.length}명) ${avg(hi,axis)} · 적음(${lo.length}명) ${avg(lo,axis)}  ${ok(avg(hi,axis)>avg(lo,axis))}`);
}
// 2) 억부 — 설기 계열은 감당해야 쓸 수 있다
console.log("\n억부 — 같은 식상을 가져도 감당 여부로 갈려야 한다");
const hiSik = rows.filter((r) => r.g.식상 >= 2.5);
const strong = hiSik.filter((r) => r.str >= 55), weak = hiSik.filter((r) => r.str < 35);
console.log(`  식상 2.5+ 중 신강(${strong.length}명) 표현력 ${avg(strong,"표현력")} · 신약(${weak.length}명) ${avg(weak,"표현력")}  ${ok(avg(strong,"표현력")>avg(weak,"표현력"))}`);
console.log("\n억부 — 받쳐 주는 계열(인성)은 감당의 문제가 아니다");
const hiIn = rows.filter((r) => r.g.인성 >= 2);
const inS = hiIn.filter((r) => r.str >= 55), inW = hiIn.filter((r) => r.str < 35);
console.log(`  인성 2+ 중 신강(${inS.length}명) ${avg(inS,"받아주는 힘")} · 신약(${inW.length}명) ${avg(inW,"받아주는 힘")}  차이 ${Math.abs(avg(inS,"받아주는 힘")-avg(inW,"받아주는 힘"))}점 (작아야 한다)`);
// 3) 태과불급
console.log("\n태과불급 — 넘치면 늘어나는 폭이 줄어야 한다");
for (const [god, axis] of [["식상","표현력"],["관성","책임감"]]) {
  const mid = rows.filter((r) => r.g[god] >= 1.5 && r.g[god] <= 2.5);
  const over = rows.filter((r) => r.g[god] >= 3.5);
  const gap = avg(over,axis) - avg(mid,axis);
  console.log(`  ${god} 적당(${mid.length}명) ${avg(mid,axis)} → 과다(${over.length}명) ${avg(over,axis)}  차이 ${gap}점`);
}
