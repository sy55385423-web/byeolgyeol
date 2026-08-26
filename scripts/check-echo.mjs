/** 한 섹션이 같은 계산을 두 번 말하는가.
 *
 *  어구반복 검사(check-reports)는 16자 연속 일치만 본다. 어휘만 바꿔서 같은
 *  말을 두 번 하면 그 그물을 그대로 빠져나간다. 실제로 재회 리포트에서
 *  "기준점은 2026년 2월, 오늘까지 6개월째… 15개월로 잡습니다"와
 *  "2026년 2월에 헤어졌으니 6개월이 지났습니다… 15개월 정도로 보고"가
 *  한 섹션에 나란히 실렸다. 글자는 안 겹치는데 읽는 사람에게는 같은 문단이다.
 *
 *  그래서 글자가 아니라 "값"을 본다. 한 섹션의 서로 다른 문단이 같은 수치
 *  토큰(2026년 2월 · 15개월 · 80점)을 되풀이하면 같은 근거를 두 번 댄 것이다.
 *  결론에서 답을 말하고 근거에서 그 값을 다시 대는 건 정상이라, 세 문단
 *  이상에 걸쳐 같은 값이 나오거나 한 섹션에서 겹치는 값이 여럿일 때만 센다. */
import { generateReport } from "../lib/report.ts";
import { buOf } from "./_bu.js";
import { categories } from "../data/categories.ts";

const mk = (n) => { const a = []; for (let i = 0; i < n; i++) a.push({ y: 1960 + (i % 50), m: 1 + ((i * 7) % 12), d: 1 + ((i * 13) % 28), hourBranch: i % 12, gender: i % 2 ? "male" : "female" }); return a; };
const P = mk(120);
// 값 토큰 — 연월·개월·점수·퍼센트·나이. 연도 단독은 세운 나열에서 정당하게
// 여러 번 나오므로 뺀다.
const TOK = /\d{4}년\s*\d{1,2}월|\d+개월|\d+점|\d+%|\d+세/g;

const hits = new Map();
let sections = 0, echoed = 0;
for (const c of categories) for (const [i, p] of P.entries()) {
  let r; try { r = generateReport({ categoryId: c.id, breakup: buOf(c.id, i), name: "테", me: p, partner: c.needsPartner ? P[(i + 37) % P.length] : undefined, partnerName: "상", tier: "basic" }); } catch { continue; }
  if (!r) continue;
  for (const s of r.sections) {
    sections++;
    const paras = s.content.split("\n\n").map((x) => x.trim()).filter(Boolean);
    const where = new Map();              // 값 → 그 값이 나온 문단 번호들
    paras.forEach((t, pi) => {
      for (const m of new Set(t.match(TOK) ?? [])) {
        if (!where.has(m)) where.set(m, new Set());
        where.get(m).add(pi);
      }
    });
    // 결론 문단(0번)이 답을 말하고 근거 문단이 그 값을 다시 대는 건 정상이다.
    // 되풀이인지 아닌지는 근거 문단들 사이에서만 판정한다.
    const body = [...where].map(([v, ps]) => [v, new Set([...ps].filter((x) => x > 0))]);
    const shared = body.filter(([, ps]) => ps.size >= 3);
    const pairs  = body.filter(([, ps]) => ps.size === 2);
    // 근거 세 곳에 같은 값이 있거나, 두 곳에 걸친 값이 셋 이상이면 같은 근거를 되풀이한 것
    if (shared.length || pairs.length >= 3) {
      echoed++;
      const k = `${c.id} | ${s.question}`;
      if (!hits.has(k)) hits.set(k, { n: 0, vals: [...new Set([...shared, ...pairs].map(([v]) => v))].slice(0, 4) });
      hits.get(k).n++;
    }
  }
}
const rows = [...hits].sort((a, b) => b[1].n - a[1].n);
console.log(`섹션 ${sections}개 · 같은 값을 되풀이한 섹션 ${echoed} (${Math.round((echoed / sections) * 100)}%) · 문항 ${rows.length}종`);
rows.slice(0, 15).forEach(([k, v]) => console.log(String(v.n).padStart(5), k, "→", v.vals.join(", ")));
