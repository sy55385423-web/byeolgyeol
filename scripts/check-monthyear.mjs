/** "몇 월"이라고만 하고 연도를 안 대는 문장이 남아 있는가.
 *
 *  용신 오행에 해당하는 달은 매년 돌아온다. 연도 없이 "5월"이라고만 쓰면
 *  읽는 사람은 올해 5월로 받아들이는데, 실제로는 어느 해인지 정해지지 않은 값이다.
 *  월운 엔진이 그해 그달의 실제 간지로 점수를 내므로 연도를 함께 적어야 한다. */
import { generateReport } from "../lib/report.ts";
import { buOf } from "./_bu.js";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1955+(i*7)%60+1,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(30);
// 연도 없이 등장하는 "N월" — 앞 12자 안에 "년"이 없으면 연도 미상으로 본다
const BARE=/(?<!\d{4}년\s?)(?<![\d])([1-9]|1[0-2])월/g;
const hit={}; let tot=0;
for(const c of categories) for(const [i,p] of P.entries()){
  let r; try{r=generateReport({categoryId:c.id,breakup:buOf(c.id,i),name:"테",me:p,partner:c.needsPartner?P[(i+13)%P.length]:undefined,partnerName:"상",tier:"basic"});}catch{continue}
  if(!r)continue;
  for(const s of r.sections) for(const line of s.content.split(/(?<=다\.)\s+/)){
    let m; BARE.lastIndex=0;
    while((m=BARE.exec(line))){
      const before=line.slice(Math.max(0,m.index-14),m.index);
      if(/\d{4}년\s?$/.test(before)) continue;      // "2027년 8월" — 정상
      if(/월지|월간|월주|개월|몇 ?월|같은 /.test(before)) continue;
      tot++; const k=`${c.id}/${s.question}`; (hit[k]??={n:0,ex:line.trim().slice(0,72)}).n++;
    }
  }
}
const rows=Object.entries(hit).sort((a,b)=>b[1].n-a[1].n);
console.log(`연도 없는 "N월" ${tot}건 · ${rows.length}자리`);
rows.slice(0,10).forEach(([k,v])=>console.log(`  ${String(v.n).padStart(4)}회 [${k}]`,v.ex));
