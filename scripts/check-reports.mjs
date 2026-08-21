import { generateReport } from "../lib/report.ts";
import { buOf } from "./_bu.js";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1960+(i%50),m:1+((i*7)%12),d:1+((i*13)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const people=mk(150);
let N=0,err=0,CH=0,E=0,rep=0,miss=0,broken=0,bad=0,frag=0;const PC=[];
const BAN=[/무조건\s*(?!적)[^.]{0,12}(됩니다|할 것입니다)/,/100\s*%/,/이혼|파산|사망|불치/,/(^|[^내외일부])부적(을|이|은)/,/굿을|유료 상담/];
for(const c of categories) for(const [i,p] of people.entries()){
  let r; try{ r=generateReport({categoryId:c.id,breakup:buOf(c.id,i),name:"테",me:p,partner:c.needsPartner?people[(i+37)%people.length]:undefined,partnerName:"상",tier:"basic"}); }catch(e){err++;if(err<3)console.log("ERR:",e.message);continue;}
  if(!r)continue; N++; CH+=r.sections.reduce((a,s)=>a+s.content.length,0);
  const all=r.sections.map(s=>s.content+"\n"+s.headline).join("\n");
  for(const re of BAN) if(re.test(all+"\n"+r.closingAdvice)) bad++;
  for(const s of r.sections){
    const t=s.content;
    for(let a2=0;a2<t.length-16;a2+=7){const g=t.slice(a2,a2+16); if(/^[가-힣 ]{16}$/.test(g)&&t.indexOf(g)!==t.lastIndexOf(g)){frag++;break;}}
    const sents=t.split(/(?<=다\.)\s+/).map(x=>x.trim()).filter(x=>x.length>=14);
    const f={}; for(const x of sents){f[x]=(f[x]||0)+1; if(f[x]===2)rep++;}
    PC.push(t.split("\n\n").filter(x=>x.trim()).length);
    for(const raw of t.split("\n\n")){
      const q=raw.trim(); if(!q||q==="undefined"){E++;continue;}
      if(/습니다\s+[가-힣]/.test(q))miss++;
      if(/[가-힣]습는|니다는|화이 |토이 |수이 |목가 |금가 |재과 |성과 [가-힣]{0,2}간|이라, 이 사람이라/.test(q))broken++;
    }
  }
}
console.log(`리포트 ${N}건 · 예외 ${err}`);
console.log(`  문장반복 ${rep} · 어구반복 ${frag}섹션 · 조사오류 ${broken} · 마침표 ${miss} · 빈문단 ${E} · 금지 ${bad}`);
PC.sort((a,b)=>a-b);
console.log(`  평균 ${Math.round(CH/N)}자 · 문단 최소 ${PC[0]} / 중앙 ${PC[PC.length>>1]} / 최대 ${PC[PC.length-1]} · 4문단미만 ${PC.filter(x=>x<4).length}`);
