/** 진태양시 보정이 실제로 결과를 바꾸는가.
 *
 *  한국 표준시는 동경 135도 기준인데 한반도는 126~130도에 있다. 그래서 시계 시각과
 *  실제 태양 위치가 20~35분 어긋나고, 지역마다 다르다. 1954~1961년에는 표준시
 *  자체가 UTC+8:30이었다. 시주 경계에 걸친 시각일수록 이 보정이 결과를 바꾼다. */
import { computeChart } from "../lib/saju.ts";
const p=c=>`${c.pillars.year.ko} ${c.pillars.month.ko} ${c.pillars.day.ko} ${c.pillars.hour?.ko ?? "-"}`;
console.log("같은 시각, 다른 출생지");
let diffCity=0, n=0;
for(const [y,m,d,h,mi] of [[1998,5,12,13,10],[1990,3,3,7,20],[2001,9,9,19,5],[1975,11,20,1,15],[1988,6,30,15,40]]){
  const seoul=computeChart({y,m,d,hour:h,minute:mi,lon:126.978,hourBranch:Math.floor(((h+1)%24)/2),gender:"female"});
  const busan=computeChart({y,m,d,hour:h,minute:mi,lon:129.075,hourBranch:Math.floor(((h+1)%24)/2),gender:"female"});
  n++; const same=p(seoul)===p(busan); if(!same)diffCity++;
  console.log(`  ${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")} ${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}  서울 ${p(seoul)}${same?"":`  ≠ 부산 ${p(busan)}`}`);
}
console.log(`\n과거 표준시(1954~1961 UTC+8:30) 구간`);
for(const [y,m,d,h] of [[1958,6,15,12],[1956,3,10,9],[1960,8,1,18]]){
  const c=computeChart({y,m,d,hour:h,minute:0,lon:126.978,hourBranch:Math.floor(((h+1)%24)/2),gender:"male"});
  const raw=computeChart({y,m,d,hourBranch:Math.floor(((h+1)%24)/2),gender:"male"});
  console.log(`  ${y}-${m}-${d} ${h}:00  보정 ${p(c)}  ${p(c)===p(raw)?"(시진만 입력해도 같음)":`≠ 시진만 ${p(raw)}`}`);
}
console.log(`\n출생지가 결과를 바꾼 경우 ${diffCity}/${n}`);
