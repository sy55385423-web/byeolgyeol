/** 한 리포트 안에서 같은 문장이 여러 섹션에 반복되는가 */
import { generateReport } from "../lib/report.ts";
import { buOf } from "./_bu.js";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1955+(i*7)%60+1,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(30);
for(const c of categories){
  let worstN=0, worstT="", sumDup=0, n=0, dupChars=0, totChars=0;
  for(const [i,p] of P.entries()){
    let r; try{r=generateReport({categoryId:c.id,breakup:buOf(c.id,i),name:"테",me:p,partner:c.needsPartner?P[(i+13)%P.length]:undefined,partnerName:"상",tier:"basic"});}catch{continue}
    if(!r)continue; n++;
    const f={};
    for(const s of r.sections) for(const t of new Set(s.content.split(/(?<=다\.)\s+/).map(x=>x.trim()).filter(x=>x.length>=14))) f[t]=(f[t]||0)+1;
    let d=0;
    for(const [t,v] of Object.entries(f)){ totChars+=t.length*v; if(v>1){ d+=v-1; dupChars+=t.length*(v-1); if(v>worstN){worstN=v;worstT=t;} } }
    sumDup+=d;
  }
  console.log(`${c.id.padEnd(19)} 리포트당 중복문장 ${String(Math.round(sumDup/n)).padStart(3)}개 · 글자 ${String(Math.round(dupChars/totChars*100)).padStart(2)}% · 최다 ${worstN}회: ${worstT.slice(0,44)}`);
}
