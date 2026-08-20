/** 문항에 들어간 규칙이 그 문항과 같은 계열인가.
 *
 *  한 주제의 규칙은 리포트 안에서 한 번씩만 쓴다. 그래서 문항이 열세 개인
 *  카테고리에서 모든 문항을 제 주제 규칙으로만 채우려면 규칙이 예순 개 넘게
 *  있어야 한다. 현실적이지 않고, 사람이 상담할 때도 인접한 자리를 끌어온다.
 *
 *  문제가 되는 건 **계열이 다른** 규칙이다. 연애를 물었는데 조후(몸)나
 *  오행 편중도(건강)가 나오면 그건 질문과 무관한 답이다.
 *  여기서는 계열 밖에서 끌어온 비율을 본다. 목표 0%. */
const FAMILY = {
  연애: ["매력","끌림","인기","연애패턴","연애주의","배우자","결혼시기","연애시기","궁합","재회"],
  인생: ["성격","인생흐름","전성기","대운"],
  일돈: ["직업","재물"],
  건강: ["건강"],
};
const famOf = t => Object.entries(FAMILY).find(([,v])=>v.includes(t))?.[0] ?? "기타";
import { buildFacts } from "../lib/knowledge/facts.ts";
import { compose, newLedger, ALL_RULES } from "../lib/knowledge/compose.ts";
import { topicOf } from "../lib/knowledge/topicMap.ts";
import { computeChart } from "../lib/saju.ts";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1955+(i*7)%60+1,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(20);
const byId=new Map(ALL_RULES.map(r=>[r.id,r]));
const acc={};
for(const c of categories) for(const p of P){
  const ch=computeChart(p); const f=buildFacts(ch,"테",new Date()); const led=newLedger();
  c.questions.forEach((q,qi)=>{
    const t=topicOf(q,c.id); const n=qi===0?6:5;
    const got=compose(f,t,n,led,ALL_RULES,q,c.questions);
    // 같은 계열이면 관련 있는 것으로 본다
    const fam=famOf(t);
    const own=got.filter(g=>(byId.get(g.id)?.topics??[]).some(x=>famOf(x)===fam)).length;
    const k=`${c.id}|${q}`;
    (acc[k]??={own:0,all:0,zero:0,n:0});
    acc[k].own+=own; acc[k].all+=got.length; acc[k].n++;
    if(got.length&&own===0) acc[k].zero++;
  });
}
const rows=Object.entries(acc).map(([k,v])=>({q:k, rate: v.all?v.own/v.all:1, zero:v.zero/v.n, all:v.all/v.n}));
const bad=rows.filter(r=>r.rate<1).sort((a,b)=>a.rate-b.rate);
const zero=rows.filter(r=>r.zero>=0.5);
console.log(`문항 ${rows.length}개 · 같은 계열 규칙 비율 평균 ${Math.round(rows.reduce((a,b)=>a+b.rate,0)/rows.length*100)}%`);
console.log(`  절반 넘게 다른 계열 ${bad.length}개 · 아예 전부 다른 계열 ${zero.length}개\n`);
bad.slice(0,16).forEach(r=>{const [c,q]=r.q.split("|");console.log(`  ${Math.round(r.rate*100).toString().padStart(3)}%  [${c}] ${q}  (문단 ${r.all.toFixed(1)})`)});
