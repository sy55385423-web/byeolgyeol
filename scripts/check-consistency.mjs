/** 한 리포트 안에서 "필요한 기운"이 두 가지로 말해지는지 본다.
 *  용신(useEl)과 lacking을 섞어 쓰면 "필요한 건 금"이라고 해 놓고 몇 문단 뒤에
 *  "부족한 수를 채워 주는 사람"이라고 말하게 된다. 사용자가 바로 알아채는 모순이다. */
import { generateReport } from "../lib/report.ts";
import { buOf } from "./_bu.js";
import { computeChart } from "../lib/saju.ts";
import { categories } from "../data/categories.ts";
const EL=["목","화","토","금","수"];
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1960+(i%50),m:1+((i*7)%12),d:1+((i*13)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const people=mk(150);
let n=0,bad=0; const ex=[];
for(const c of categories) for(const [i,p] of people.entries()){
  let r,ch; try{ ch=computeChart(p); r=generateReport({categoryId:c.id,breakup:buOf(c.id,i),name:"수연",me:p,partner:c.needsPartner?people[(i+37)%people.length]:undefined,partnerName:"준호",tier:"basic"});}catch{continue;}
  if(!r)continue; n++;
  const txt=r.sections.map(s=>s.content).join("\n");
  const need=EL[ch.useEl];
  // "필요한/채워 주는 기운"으로 언급된 오행을 모은다
  const m=[...txt.matchAll(/(?:필요한|채워\s*주는|채우려면|메워\s*주는)[^.]{0,12}?([목화토금수])\s*기운/g)].map(x=>x[1]);
  const wrong=[...new Set(m.filter(x=>x!==need))];
  if(wrong.length){ bad++; if(ex.length<3) ex.push(`${c.id} 용신 ${need} 인데 ${wrong.join(",")} 로도 말함`); }
}
console.log(`리포트 ${n}건 · 용신 불일치 ${bad}건`);
ex.forEach(e=>console.log("  ",e));
