/** 레이더 축의 10분위 기준점을 다시 잰다.
 *
 *  AXIS_FN(축 계산식)을 고치면 반드시 이걸 돌려서 lib/report.ts의
 *  AXIS_DECILES를 갱신해야 한다. 안 그러면 백분위가 옛 분포 기준으로 매겨진다.
 *
 *  rawAxisScores가 radarStats와 같은 계산식을 쓴다.
 *  예전에는 이 스크립트가 계산식을 통째로 베껴 놨는데, 식을 고칠 때마다
 *  두 곳을 같이 고쳐야 했고 어긋나도 아무도 몰랐다. */
import { rawAxisScores } from "../lib/report.ts";
import { computeChart } from "../lib/saju.ts";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1940+(i*3)%85,m:1+((i*5)%12),d:1+((i*11)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const P=mk(400), out={};
for(const c of categories){
  const cols=[[],[],[],[],[]];
  for(const [i,p] of P.entries()){
    const me=computeChart(p), pt=c.needsPartner?computeChart(P[(i+37)%P.length]):undefined;
    rawAxisScores({me,pt,c,input:{me:p},tier:"basic"}).forEach((v,k)=>{ if(cols[k]) cols[k].push(v); });
  }
  out[c.id]=cols.map(v=>{v.sort((a,b)=>a-b);return [1,2,3,4,5,6,7,8,9].map(q=>Math.round(v[Math.floor(v.length*q/10)]*10)/10);});
}
console.log(JSON.stringify(out));
