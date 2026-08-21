import { generateReport } from "../lib/report.ts";
import { buOf } from "./_bu.js";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1960+(i%50),m:1+((i*7)%12),d:1+((i*13)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const people=mk(120); const hit={};
for(const c of categories) for(const [i,p] of people.entries()){
  let r; try{ r=generateReport({categoryId:c.id,breakup:buOf(c.id,i),name:"테",me:p,partner:c.needsPartner?people[(i+37)%people.length]:undefined,partnerName:"상",tier:"basic"});}catch{continue;}
  if(!r)continue;
  for(const s of r.sections){ const t=s.content;
    for(let a=0;a<t.length-16;a++){const g=t.slice(a,a+16);
      if(/^[가-힣 ]{16}$/.test(g)&&t.indexOf(g)!==t.lastIndexOf(g)){hit[g]=(hit[g]||0)+1;a+=15;}}}
}
Object.entries(hit).sort((a,b)=>b[1]-a[1]).slice(0,25).forEach(([k,v])=>console.log(String(v).padStart(5),JSON.stringify(k)));
