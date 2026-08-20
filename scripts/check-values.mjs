/** 답이 명식에서 나오는지 본다.
 *  seed에서 만든 답은 사람마다 고르게 흩어지지만 근거가 없다. 명식에서 나온 답은
 *  분포가 치우칠 수 있어도 같은 명식이면 항상 같고, 다른 명식이면 이유가 있어 다르다.
 *  여기서는 (1) 값이 실제로 갈리는지 (2) 한 값으로 쏠리지 않는지 둘 다 본다. */
import { computeChart } from "../lib/saju.ts";
import { values } from "../lib/report.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1955+(i%60),m:1+((i*7)%12),d:1+((i*13)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const ppl=mk(300), dist={};
for(const [i,p] of ppl.entries()){
  const me=computeChart(p), pt=computeChart(ppl[(i+37)%ppl.length]);
  const v=values({me,pt,input:{me:p},tier:"basic"});
  for(const [q,{v:val}] of Object.entries(v)) ((dist[q]??={})[val]??=0), dist[q][val]++;
}
const WATCH=["나는 어떤 사람에게 끌릴까","나의 바람기 지수","나의 가치관","타고난 재물의 그릇",
  "돈이 들어오는 방식과 통로","투자운","해외·이동 운","나에게 맞는 지역과 환경",
  "평생 피해야 할 선택이나 행동","궁합 총점수","재회 가능성","헤어진 진짜 이유","나의 초년운","나의 전성기, 주의가 필요한 시기","결혼 예상 나이","얼마나 오래 만날지",
  "지금 연인이 최선의 선택인지","스킨십·애정표현 궁합","상대방의 현재 마음","둘의 연애가 어땠는지","결혼 시 주의점"];
for(const q of WATCH){
  const d=dist[q]; if(!d){console.log("(없음)",q);continue;}
  const e=Object.entries(d).sort((a,b)=>b[1]-a[1]);
  const top=Math.round(e[0][1]/300*100);
  console.log(`${q}  종류 ${e.length}  최다 ${top}%  ${e.slice(0,3).map(([k,n])=>`${k}:${n}`).join(" · ")}${top>70?"  ◀ 쏠림":""}`);
}
