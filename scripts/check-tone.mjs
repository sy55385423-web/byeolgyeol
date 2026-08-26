/** 리포트 말투 검사.
 *
 *  근거가 붙어 있고 조사가 맞아도 읽는 맛은 따로다. 여기서 보는 것:
 *    단정      "반드시", "무조건", "절대" — 명식으로 낼 수 없는 확신
 *    겁주기    "위험", "조심하지 않으면", "탈이 납니다"
 *    상투구    "~하는 편이 좋습니다"가 리포트마다 몇 번 나오는가
 *    설교      "~하세요"로 끝나는 문장의 비율
 *    문장 길이 100자 넘는 문장은 한 번에 안 읽힌다
 *    같은 시작 한 섹션에서 같은 두 어절로 시작하는 문장 */
import { generateReport } from "../lib/report.ts";
import { buOf } from "./_bu.js";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1965+(i%45),m:1+((i*7)%12),d:1+((i*13)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(80);

const HARD=/반드시|무조건|절대(로)?|틀림없이|100%/;
// "무너집니다"는 "자는 시간이 흔들릴 때 가장 먼저 무너집니다"처럼
// 겁주기가 아닌 자리에서 더 많이 쓰인다. 실제로 위협적인 것만 본다.
const SCARE=/위험합니다|큰일 ?납|파국|망합니다|재앙|불행해집니다|탈이 납니다|돌이킬 수 없|평생 후회/;
const CLICHE=[/편이 좋습니다/g,/편이 낫습니다/g,/필요가 있습니다/g,/중요합니다/g,/할 수 있습니다/g];

let nSent=0,nLong=0,nOrder=0,nHard=0,nScare=0,nSermon=0,nSec=0;
const cliche=new Array(CLICHE.length).fill(0);
const longest=[]; const hardEx=[]; const scareEx=[]; const openers=new Map();

for(const c of categories) for(const [i,p] of P.entries()){
  let r; try{r=generateReport({categoryId:c.id,breakup:buOf(c.id,i),name:"테",me:p,partner:c.needsPartner?P[(i+23)%P.length]:undefined,partnerName:"상",tier:"basic"});}catch{continue}
  if(!r)continue;
  for(const s of r.sections){
    nSec++;
    const sents=s.content.split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(Boolean);
    const firsts=new Map();
    for(const t of sents){
      nSent++;
      if(t.length>100){nLong++; if(longest.length<400) longest.push(t);}
      if(t.length>160) nOrder++;
      if(HARD.test(t)){nHard++; if(hardEx.length<6) hardEx.push(`[${c.id}] ${t.slice(0,90)}`);}
      if(SCARE.test(t)){nScare++; if(scareEx.length<6) scareEx.push(`[${c.id}] ${t.slice(0,90)}`);}
      if(/세요\.$|십시오\.$/.test(t)) nSermon++;
      CLICHE.forEach((re,k)=>{ const m=t.match(re); if(m) cliche[k]+=m.length; });
      const two=t.split(/\s+/).slice(0,2).join(" ");
      if(two.length>3){ firsts.set(two,(firsts.get(two)||0)+1); }
    }
    for(const [k,v] of firsts) if(v>=3) openers.set(`${c.id}|${k}`,(openers.get(`${c.id}|${k}`)||0)+1);
  }
}
const pct=n=>((n/nSent)*100).toFixed(1)+"%";
console.log(`문장 ${nSent.toLocaleString()}개 · 섹션 ${nSec.toLocaleString()}개`);
console.log(`  100자 넘는 문장     ${nLong.toLocaleString()} (${pct(nLong)})   160자 넘는 문장 ${nOrder}`);
console.log(`  단정 표현          ${nHard} (${pct(nHard)})`);
console.log(`  겁주는 표현        ${nScare} (${pct(nScare)})`);
console.log(`  "~하세요"로 끝     ${nSermon.toLocaleString()} (${pct(nSermon)})`);
console.log("  상투구 (문장 1,000개당)");
["편이 좋습니다","편이 낫습니다","필요가 있습니다","중요합니다","할 수 있습니다"].forEach((n,k)=>
  console.log(`     ${n.padEnd(12)} ${(cliche[k]/nSent*1000).toFixed(1)}`));
const op=[...openers].sort((a,b)=>b[1]-a[1]).slice(0,6);
if(op.length){ console.log("  한 섹션에서 3번 이상 같은 두 어절로 시작"); op.forEach(([k,v])=>console.log(`     ${String(v).padStart(5)} ${k}`)); }
if(hardEx.length){ console.log("  단정 예시"); hardEx.forEach(x=>console.log("     "+x)); }
if(scareEx.length){ console.log("  겁주기 예시"); scareEx.forEach(x=>console.log("     "+x)); }
longest.sort((a,b)=>b.length-a.length);
console.log("  가장 긴 문장 3개");
longest.slice(0,3).forEach(t=>console.log(`     ${t.length}자 · ${t.slice(0,110)}…`));
