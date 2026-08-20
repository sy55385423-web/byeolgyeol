/** 모든 문항의 답이 명식에서 나오는가 — 전수 감사.
 *
 *  검사 방법
 *   1) 같은 생년월일 → 항상 같은 답인가 (결정론적)
 *   2) 명식이 다르면 답도 갈리는가 (한 값으로 고정돼 있지 않은가)
 *   3) seed(생년월일 해시)만 바꾸고 명식을 고정할 수는 없으므로,
 *      대신 "명식 사실 하나가 같은 사람끼리 답이 같은지"를 본다.
 *      예: 용신이 같으면 '맞는 지역'도 같아야 한다 → 명식 근거가 있다는 뜻 */
import { values } from "../lib/report.ts";
import { computeChart } from "../lib/saju.ts";
import { analyzeTiming } from "../lib/timing.ts";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1950+(i*7)%70,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(200);
const rows=[];
for(const [i,p] of P.entries()){
  const me=computeChart(p), pt=computeChart(P[(i+37)%P.length]);
  const A=analyzeTiming(me).analysis;
  rows.push({ v: values({me,pt,input:{me:p},tier:"basic"}), A, me });
}
// 문항 목록
const qs=[...new Set(categories.flatMap(c=>c.questions))];
const CHART_KEYS={
  용신: r=>r.A.useEl, 기신: r=>r.A.avoidEl, 일간: r=>r.A.dayStem, 강약: r=>r.A.strong,
  격국: r=>r.A.gyeok.name, 두꺼운오행: r=>r.A.dominant,
  재성: r=>Math.round(r.A.groupWeight.재성), 관성: r=>Math.round(r.A.groupWeight.관성),
  식상: r=>Math.round(r.A.groupWeight.식상), 비겁: r=>Math.round(r.A.groupWeight.비겁), 인성: r=>Math.round(r.A.groupWeight.인성),
  성별: r=>r.me.isMale, 대운시작: r=>r.me.luck?.startAge,
};
let ok=0, flat=0, unlinked=[];
for(const q of qs){
  const vals=rows.map(r=>r.v[q]?.v).filter(x=>x!==undefined);
  if(!vals.length) continue;
  const kinds=new Set(vals).size;
  if(kinds<=1){ flat++; console.log(`◀ 한 값 고정: ${q} = "${vals[0]}"`); continue; }
  // 어떤 명식 사실이 이 답을 설명하는가 — 그 사실이 같으면 답도 같은지
  let best=null;
  for(const [name,fn] of Object.entries(CHART_KEYS)){
    const byKey=new Map();
    let consistent=0, total=0;
    for(const r of rows){ const v=r.v[q]?.v; if(v===undefined)continue; const k=String(fn(r));
      if(!byKey.has(k)) byKey.set(k,v); total++; if(byKey.get(k)===v) consistent++; }
    const score=consistent/total;
    if(!best||score>best.score) best={name,score};
  }
  if(best.score>=0.99) ok++;
  else unlinked.push({q,kinds,best});
}
console.log(`\n문항 ${qs.length}개 · 한 값 고정 ${flat}개 · 명식 사실 하나로 완전히 설명되는 답 ${ok}개`);
console.log(`\n여러 사실이 섞여 계산되는 답 ${unlinked.length}개 (조합 계산이라 정상일 수 있음):`);
unlinked.sort((a,b)=>b.best.score-a.best.score).forEach(u=>console.log(`  ${String(u.kinds).padStart(3)}종  ${u.q}  (가장 가까운 사실: ${u.best.name} ${Math.round(u.best.score*100)}%)`));
