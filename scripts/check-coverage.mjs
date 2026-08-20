import { buildFacts } from "../lib/knowledge/facts.ts";
import { coverage, ALL_RULES } from "../lib/knowledge/compose.ts";
import { computeChart } from "../lib/saju.ts";
const T=["매력","끌림","인기","연애패턴","연애주의","배우자","결혼시기","연애시기","성격","인생흐름","전성기","대운","직업","재물","건강","궁합","재회"];
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1960+(i%50),m:1+((i*7)%12),d:1+((i*13)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const ppl=mk(200), agg={};
for(const [i,p] of ppl.entries()){
  const c=computeChart(p), o=computeChart(ppl[(i+37)%ppl.length]);
  const f=buildFacts(c,"테",new Date(),{chart:o,name:"상"});
  for(const {topic,matched} of coverage(f,T)) (agg[topic]??=[]).push(matched);
}
console.log("규칙",ALL_RULES.length,"개");
for(const t of T){const v=agg[t].sort((a,b)=>a-b);
  console.log(" ",t.padEnd(5),"최소",String(v[0]).padStart(2),"중앙",String(v[v.length>>1]).padStart(2),"최대",String(v[v.length-1]).padStart(2), v[0]<3?"◀ 부족":"");}
