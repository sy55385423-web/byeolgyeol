import { generateReport } from "../lib/report.ts";
import { categories } from "../data/categories.ts";
import { ELEMENTS, STEMS, BRANCHES } from "../lib/core/ganji.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1960+(i%50),m:1+((i*7)%12),d:1+((i*13)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const people=mk(150);
const GODS=["비견","겁재","식신","상관","편재","정재","편관","정관","편인","정인"];
// 템플릿이 실제로 끼워 넣는 낱말만 검사한다. 동사 관형형(있는·않는)은 조사가 아니다.
const NOUNS=[...new Set([ "님","당신","상대","사람","기운","일간","일지","월지","년지","시지","용신","희신","기신",
  ...ELEMENTS, ...STEMS, ...BRANCHES, ...GODS, ...GODS.map(g=>g+"격"), "건록격","양인격","월겁격",
  // 12운성 중 한 글자짜리(쇠·병·사·묘·절·태·양)는 뺀다. "사이", "양쪽"처럼
  // 흔한 낱말에 걸려 오탐만 만든다. 두 글자 이상만 신뢰할 수 있다.
  "장생","목욕","관대","건록","제왕",
  "도화","역마","화개","공망","천을귀인","문창귀인","양인","대운","세운","월운" ])];
const jong=c=>{const k=c.charCodeAt(0); return k>=0xac00&&k<=0xd7a3 ? (k-0xac00)%28!==0 : null;};
const RIEUL=c=>{const k=c.charCodeAt(0); return (k-0xac00)%28===8;};
const N=NOUNS.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|");
// "수연님와"처럼 이름 뒤에 붙는 낱말은 앞 글자가 한글이다. 낱말 경계를 요구하면
// 놓친다. 이름에 붙는 것들(님)만 경계 없이 보고, 나머지는 경계를 요구한다.
const BOUND=new RegExp(`(?:^|[^가-힣])(${N})(은|는|이|가|을|를|과|와|으로|로|이라|라)(?=[\\s,.\\u2014)]|$)`,"g");
const SUFFIX=/(님)(은|는|이|가|을|를|과|와|으로|로|이라|라)(?=[\s,.\u2014)]|$)/g;
const OK={은:1,는:0,이:1,가:0,을:1,를:0,과:1,와:0,이라:1,라:0};
const STOP=new Set(["사이","사이라","자라","오라","미라","해라","신라","술과","진과"]);
const hits={}; const ALLTEXT=[];
for(const c of categories) for(const [i,p] of people.entries()){
  let r; try{ r=generateReport({categoryId:c.id,name:"수연",me:p,partner:c.needsPartner?people[(i+37)%people.length]:undefined,partnerName:"준호",tier:"basic"});}catch{continue;}
  if(!r)continue;
  const txt=[...r.sections.map(s=>s.content),r.closingAdvice||"",r.freeSummary||""].join("\n");
  ALLTEXT.push(txt);
  for(const RE of [BOUND,SUFFIX]){
  let m; RE.lastIndex=0;
  while((m=RE.exec(txt))){
    const w=m[1], j=m[2], last=w[w.length-1], h=jong(last);
    if(h===null)continue;
    // 지지 '사(巳)'가 낱말 '사이'에 걸린다. 한 글자 지지 + 조사가 그대로 다른 낱말이
    // 되는 경우는 문맥 없이 못 가른다. 알려진 것만 건너뛴다.
    if(STOP.has(w+j))continue;
    let bad;
    if(j==="로"||j==="으로") bad = (!h||RIEUL(last)) ? j!=="로" : j!=="으로";
    else bad = h !== (OK[j]===1);
    if(bad){ const k=w+j; (hits[k]??={n:0,ex:txt.slice(Math.max(0,m.index-16),m.index+w.length+j.length+10).replace(/\n/g," ")}).n++; }
  }
  }
}
// 괄호 뒤 조사 — "계(수)이", "신(금)가" 처럼 괄호가 끼면 위 검사가 못 본다.
// 조사는 괄호 안 마지막 한글의 받침을 따라간다.
const PAREN=/([가-힣])\([^()]*\)(은|는|이|가|을|를|과|와)(?=[\s,.\u2014)]|$)/g;
for(const txt of ALLTEXT){
  let m; PAREN.lastIndex=0;
  while((m=PAREN.exec(txt))){
    const h=jong(m[1]); if(h===null)continue;
    if(h!==(OK[m[2]]===1)){const k=`${m[1]}(…)${m[2]}`;(hits[k]??={n:0,ex:txt.slice(Math.max(0,m.index-16),m.index+12).replace(/\n/g," ")}).n++;}
  }
}
const rows=Object.entries(hits).sort((a,b)=>b[1].n-a[1].n);
console.log("조사 오류 종류",rows.length,"· 총",rows.reduce((a,b)=>a+b[1].n,0));
rows.slice(0,25).forEach(([k,v])=>console.log(String(v.n).padStart(6),k,"|",v.ex));
