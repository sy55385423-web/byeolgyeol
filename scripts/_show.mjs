import { generateReport } from "../lib/report.ts";
const cid=process.argv[2], qm=process.argv[3];
const r=generateReport({categoryId:cid,name:"수연",me:{y:1998,m:5,d:12,hourBranch:6,gender:"female"},partner:{y:1995,m:11,d:3,hourBranch:2,gender:"male"},partnerName:"준호",tier:"basic"});
for(const s of r.sections) if(!qm||s.question.includes(qm)){
  console.log("▶",s.headline);
  s.content.split("\n\n").forEach(p=>console.log("  ·",p));
  console.log();
}
