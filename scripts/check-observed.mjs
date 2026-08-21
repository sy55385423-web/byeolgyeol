/** 실제 사람의 체감과 대조한다.
 *
 *  원리 검증(check-profile.mjs)은 "내가 정한 원리대로 도는가"만 본다.
 *  실제로 맞는지는 사람을 대조해야 알 수 있다. 아래는 사용자가 직접 아는
 *  사람들의 체감이다. 완전 일치는 목표가 아니고, **정반대로 나오는 항목이
 *  없는 것**이 목표다(두 칸 이상 어긋나면 정반대로 본다). */
import { radarStats } from "../lib/report.ts";
import { computeChart } from "../lib/saju.ts";
import { categories } from "../data/categories.ts";
const c = categories.find((x) => x.id === "love-life");

// 체감 등급 → 숫자. 매우높음 5 · 높음 4 · 보통~높음 3.5 · 보통 3 · 보통~낮음 2.5 · 낮음 2
const B = { "매우높음": 5, "높음": 4, "보통~높음": 3.5, "보통": 3, "보통~낮음": 2.5, "낮음": 2 };
const CASES = [
  { who: "2003-07-01 축시 남", me: { y: 2003, m: 7, d: 1, hourBranch: 1, gender: "male" },
    obs: { 사교성: "보통", 감정표현: "보통~낮음", 독립성: "매우높음", 신뢰감: "높음", 책임감: "보통" } },
  { who: "2005-08-03 미시 여", me: { y: 2005, m: 8, d: 3, hourBranch: 7, gender: "female" },
    obs: { 사교성: "보통", 감정표현: "보통~높음", 독립성: "높음", 신뢰감: "보통~높음", 책임감: "높음" } },
  { who: "2001-01-23 시간모름 여", me: { y: 2001, m: 1, d: 23, gender: "female" },
    obs: { 사교성: "매우높음", 감정표현: "보통", 독립성: "보통~낮음", 신뢰감: "높음", 책임감: "보통" } },
  { who: "2005-04-28 시간모름 남", me: { y: 2005, m: 4, d: 28, gender: "male" },
    obs: { 사교성: "보통~높음", 감정표현: "보통~높음", 독립성: "보통", 신뢰감: "보통~낮음", 책임감: "보통~낮음" } },
];
/** 앱 점수 → 등급 숫자 */
const band = (v) => (v >= 85 ? 5 : v >= 75 ? 4 : v >= 68 ? 3.5 : v >= 60 ? 3 : v >= 53 ? 2.5 : 2);
const name = (n) => (n >= 5 ? "매우높음" : n >= 4 ? "높음" : n >= 3.5 ? "보통~높음" : n >= 3 ? "보통" : n >= 2.5 ? "보통~낮음" : "낮음");

let total = 0, opposite = 0, near = 0;
for (const cs of CASES) {
  const r = radarStats({ me: computeChart(cs.me), c, input: { me: cs.me }, tier: "basic" });
  const bad = [];
  console.log(`\n▶ ${cs.who}   ${r.title} ${r.score} · ${r.caption}`);
  for (const a of r.axes) {
    const app = band(a.value), obs = B[cs.obs[a.label]];
    const gap = app - obs;
    total++;
    if (Math.abs(gap) >= 2) { opposite++; bad.push(a.label); }
    else if (Math.abs(gap) <= 0.5) near++;
    const mark = Math.abs(gap) >= 2 ? "✕ 정반대" : Math.abs(gap) <= 0.5 ? "✓" : "△";
    console.log(`   ${a.label.padEnd(5)} ${String(a.value).padStart(3)} (${name(app).padEnd(6)}) ↔ ${cs.obs[a.label].padEnd(6)}  ${mark}`);
  }
  if (bad.length) console.log(`   정반대: ${bad.join(", ")}`);
}
console.log(`\n═══ 항목 ${total}개 · 정반대 ${opposite}개 · 거의 일치 ${near}개 (${Math.round(near/total*100)}%)`);
