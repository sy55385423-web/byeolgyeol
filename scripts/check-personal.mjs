/** 리포트가 실제로 그 사람 것인가.
 *
 *  두 지표를 본다.
 *    고정문장  90% 이상에게 똑같이 나가는 문장이 출력에서 차지하는 비율.
 *              명식과 무관한 '분량 채우기'가 여기 잡힌다. 낮을수록 좋다.
 *    변별력    서로 다른 두 사람의 리포트가 얼마나 다른가. 높을수록 좋다.
 *
 *  목표: 고정문장 20% 이하, 변별력 70% 이상. */
import { generateReport } from "../lib/report.ts";
import { buOf } from "./_bu.js";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1955+(i*7)%60+1,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(50);
const sents=r=>r.sections.flatMap(s=>s.content.split(/(?<=다\.)\s+/).map(x=>x.trim()).filter(x=>x.length>=14));
let gFixed=0,gTotal=0,gDiff=0,gN=0;
console.log("카테고리            고정문장   변별력   worst 고정문장");
for(const c of categories){
  const rs=[];
  for(const [i,p] of P.entries()){
    let r; try{r=generateReport({categoryId:c.id,breakup:buOf(c.id,i),name:"테",me:p,partner:c.needsPartner?P[(i+23)%P.length]:undefined,partnerName:"상",tier:"basic"});}catch{continue}
    if(r)rs.push(r);
  }
  const N=rs.length, cnt={};
  for(const r of rs) for(const t of new Set(sents(r))) cnt[t]=(cnt[t]||0)+1;
  const all=sents(rs[0]).length; // 대표
  let fixedChars=0,totalChars=0;
  for(const r of rs) for(const t of sents(r)){ totalChars+=t.length; if(cnt[t]>=N*0.9) fixedChars+=t.length; }
  const S=rs.map(r=>new Set(sents(r)));
  let sum=0,n=0;
  for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++){let x=0;for(const t of S[i])if(S[j].has(t))x++;sum+=1-x/(S[i].size+S[j].size-x);n++;}
  const fx=Math.round(fixedChars/totalChars*100), df=Math.round(sum/n*100);
  gFixed+=fixedChars; gTotal+=totalChars; gDiff+=df; gN++;
  const worst=Object.entries(cnt).filter(([,v])=>v>=N*0.9).sort((a,b)=>b[0].length-a[0].length)[0];
  console.log(`  ${c.id.padEnd(19)} ${String(fx).padStart(3)}%${fx>20?" ◀":"  "}    ${String(df).padStart(3)}%${df<70?" ◀":"  "}   ${worst?worst[0].slice(0,40):"—"}`);
}
console.log(`\n전체  고정문장 ${Math.round(gFixed/gTotal*100)}%  ·  변별력 ${Math.round(gDiff/gN)}%`);
