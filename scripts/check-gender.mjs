/** 성별을 바꾸면 리포트가 실제로 달라지는가.
 *
 *  명리에서 이성운을 보는 자리는 남명 재성 / 여명 관성으로 완전히 갈리고,
 *  대운도 양남음녀 원칙에 따라 순행·역행이 뒤집힌다. 같은 생년월일에 성별만
 *  바꿨는데 리포트가 그대로라면 성별을 받는 의미가 없다. */
import { generateReport } from "../lib/report.ts";
import { computeChart } from "../lib/saju.ts";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1955+(i*7)%60+1,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12});return a;};
const P=mk(24);
const sents=r=>new Set(r.sections.flatMap(s=>s.content.split(/(?<=다\.)\s+/).map(x=>x.trim()).filter(x=>x.length>=14)));
const partner={y:1995,m:11,d:3,hourBranch:2,gender:"male"};
console.log("성별만 바꿨을 때 달라지는 문장 비율");
for(const c of categories){
  let sum=0,n=0;
  for(const p of P){
    const mk2=g=>generateReport({categoryId:c.id,name:"테",me:{...p,gender:g},partner:c.needsPartner?partner:undefined,partnerName:"상",tier:"basic"});
    let a,b; try{a=mk2("female");b=mk2("male");}catch{continue}
    if(!a||!b)continue;
    const A=sents(a),B=sents(b); let i=0; for(const x of A) if(B.has(x)) i++;
    sum += 1-i/(A.size+B.size-i); n++;
  }
  const pct=Math.round(sum/n*100);
  console.log(`  ${c.id.padEnd(19)} ${String(pct).padStart(3)}%${pct<15?"  ◀ 낮음":""}`);
}
// 대운 방향이 실제로 뒤집히는지
// 양남음녀 원칙 — 년간이 양간이면 남자 순행/여자 역행, 음간이면 반대
console.log("\n대운 순역 검증 (양남음녀)");
let bad=0;
for(const y of [1985,1990,1995,1998,2001,2004]) for(const g of ["male","female"]){
  const c=computeChart({y,m:5,d:12,hourBranch:6,gender:g});
  const yang=c.pillars.year.stem%2===0;
  const want=(yang===(g==="male"));
  if(want!==c.luck.forward){ bad++; console.log(`  ◀ ${y} ${g} · 년간 ${yang?"양":"음"} · ${c.luck.forward?"순행":"역행"} (기대: ${want?"순행":"역행"})`); }
}
console.log(bad? `  ${bad}건 불일치` : "  12건 모두 원칙과 일치");
