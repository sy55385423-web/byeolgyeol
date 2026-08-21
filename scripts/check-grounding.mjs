/** 모든 문항의 답이 명식에서 나왔는가 — 근거 밀도.
 *
 *  "그럴듯한 말"과 "이 사람 명식을 읽은 말"의 차이는 근거가 문장 안에 남아 있느냐다.
 *  섹션마다 아래가 몇 개나 인용됐는지 센다.
 *
 *    간지    갑~계 / 자~해 / 무인·정사 같은 60갑자
 *    십신    비견 겁재 식신 상관 편재 정재 편관 정관 편인 정인 (+갈래명)
 *    오행    목화토금수 + 용신·희신·기신·신강·신약
 *    12운성  장생~양
 *    신살    도화 역마 화개 공망 천을귀인 문창귀인 양인
 *    수치    2.7 / 81점 / 32세 / 2031년 / 63%
 *    자미·점성  주성 이름, 궁 이름, 별자리
 *
 *  목표: 근거 0개인 섹션 0개, 섹션당 중앙값 8개 이상, 수치 인용이 있는 섹션 90% 이상. */
import { generateReport } from "../lib/report.ts";
import { buOf } from "./_bu.js";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1955+(i*7)%60+1,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(40);
const GAN=/[갑을병정무기경신임계][자축인묘진사오미신유술해]|일간|월지|일지|년지|시지|월주|일주|년주|시주/g;
const GOD=/비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인|비겁|식상|재성|관성|인성|격국|건록격|양인격|월겁격|[가-힣]{2}격/g;
const OH=/[목화토금수] 기운|용신|희신|기신|신강|신약|오행/g;
const TW=/장생|목욕|관대|건록|제왕|쇠지|병지|묘지|절지|태지|12운성/g;
const SIN=/도화|역마|화개|공망|천을귀인|문창귀인|양인|삼합|육합|충|형/g;
const NUM=/\d+\.\d|\d+점|\d+세|\d+년|\d+%|\d+자|\d+개/g;
const ZI=/자미|천기|태양|무곡|천동|염정|천부|태음|탐랑|거문|천상|천량|칠살|파군|명궁|부처궁|재백궁|관록궁|질액궁|자리|양자리|황소자리|쌍둥이자리|게자리|사자자리|처녀자리|천칭자리|전갈자리|궁수자리|염소자리|물병자리|물고기자리/g;
const cnt=(t,re)=>((t.match(re)||[]).length);
let zero=0, tot=0, withNum=0; const dens=[]; const worst=[];
for(const c of categories) for(const [i,p] of P.entries()){
  let r; try{r=generateReport({categoryId:c.id,breakup:buOf(c.id,i),name:"테",me:p,partner:c.needsPartner?P[(i+23)%P.length]:undefined,partnerName:"상",tier:"basic"});}catch{continue}
  if(!r)continue;
  for(const s of r.sections){
    const t=s.content;
    const n=cnt(t,GAN)+cnt(t,GOD)+cnt(t,OH)+cnt(t,TW)+cnt(t,SIN)+cnt(t,ZI);
    const nn=cnt(t,NUM);
    tot++; dens.push(n); if(n<4 && worst.length<6)worst.push(`근거 ${n}개 · ${c.id} / ${s.question} · ${t.slice(0,60)}`); if(n===0)zero++;
    if(nn>0) withNum++;
  }
}
dens.sort((a,b)=>a-b);
const lowN=dens.filter(x=>x<4).length;
console.log(`섹션 ${tot}개`);
console.log(`  근거 0개 섹션        ${zero}  ${zero?"◀":""}`);
console.log(`  근거 4개 미만 섹션    ${lowN} (${Math.round(lowN/tot*100)}%)`);
console.log(`  섹션당 근거 최소 ${dens[0]} / 중앙 ${dens[dens.length>>1]} / 최대 ${dens[dens.length-1]}`);
console.log(`  수치를 인용한 섹션    ${Math.round(withNum/tot*100)}%`);
worst.forEach(w=>console.log("  ",w));
