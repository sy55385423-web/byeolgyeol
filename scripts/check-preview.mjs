/** 결제 전 미리보기 카드의 한 줄이 사람마다 제대로 만들어지는지 본다.
 *
 *  미리보기 값은 이제 전부 실제 명반 엔진(values())에서 나온다. 값이 사람마다
 *  달라지므로 data/categories.ts의 prefix·suffix가 어떤 값과 붙어도 말이 돼야 한다.
 *  예전에 "확인을 강요하는 유형" + "형이에요" = "유형형이에요"가 나갔다. */
import { values, fixJosa } from "../lib/report.ts";
import { computeChart } from "../lib/saju.ts";
import { categories } from "../data/categories.ts";
const mk=n=>{const a=[];for(let i=0;i<n;i++)a.push({y:1955+(i%60),m:1+((i*7)%12),d:1+((i*13)%28),hourBranch:i%12,gender:i%2?"male":"female"});return a;};
const ppl=mk(120);
const jong=c=>{const k=c.charCodeAt(0);return k>=0xac00&&k<=0xd7a3?(k-0xac00)%28!==0:null;};
const lines=new Set(); let dup=0, josa=0, empty=0, sample=0;
const SAMPLE=new Set();
for(const c of categories){ if(!c.previewStats)continue;
  for(const st of c.previewStats) SAMPLE.add(st.label+"|"+st.value);
  for(const [i,p] of ppl.entries()){
    const me=computeChart(p), pt=computeChart(ppl[(i+37)%ppl.length]);
    const v=values({me,pt,input:{me:p},tier:"basic"});
    for(const st of c.previewStats){
      const got=v[st.label]?.v;
      if(!got){ sample++; }            // 엔진이 답을 못 내 샘플로 떨어진 항목
      const val=got||st.value;
      if(!val){ empty++; continue; }
      const line=`${st.prefix}${val}${fixJosa(st.suffix??"",val)}`;
      if(/형형|것것|사람사람|이에요이|예요예|무렵무렵/.test(line)) { if(dup<5)console.log("△ 중복:",line); dup++; }
      // 값 끝 받침과 조사 일치
      const m=line.match(/([가-힣])(은|는|이|가|을|를|과|와|이에요|예요)(?=[\s,.]|$)/g);
      const tail=fixJosa(st.suffix??"",val);
      for(const [w,j] of [[val[val.length-1],tail]]){
        const h=jong(w); if(h===null)continue;
        if(tail.startsWith("이에요")&&!h){josa++;if(josa<4)console.log("△ 조사:",line);}
        if(tail.startsWith("예요")&&h){josa++;if(josa<4)console.log("△ 조사:",line);}
      }
      lines.add(line);
    }
  }
}
console.log(`미리보기 문장 ${lines.size}종 · 중복 ${dup} · 조사 ${josa} · 빈값 ${empty} · 샘플로 떨어진 항목 ${sample}`);
