"use client";

import { motion } from "framer-motion";

/** 브랜드 모티프 — 별자리를 잇는 가는 선 하나. 장식은 이것뿐. */
function Constellation() {
  const pts = [
    [30, 150], [95, 96], [170, 118], [232, 52], [300, 84], [352, 30],
  ];
  return (
    <svg viewBox="0 0 380 180" className="w-full max-w-md text-brass" fill="none" aria-hidden>
      <motion.path
        d={`M ${pts.map((p) => p.join(" ")).join(" L ")}`}
        stroke="currentColor"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.4 }}
      />
      {pts.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={i === 3 ? 3.5 : 2}
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.3 }}
        />
      ))}
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div className="grid items-center gap-12 sm:grid-cols-[1.2fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-5 text-sm font-medium tracking-widest text-brass"
          >
            자미두수 · 사주명리 · 서양점성술
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-[2.6rem] font-semibold leading-[1.25] tracking-tight sm:text-6xl sm:leading-[1.2]"
          >
            태어난 날에
            <br />
            새겨진 결을 읽다
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-soft"
          >
            연애의 방향, 관계의 온도, 일과 돈의 흐름.
            <br />
            생년월일 하나면 3분 안에 확인할 수 있습니다.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex items-center gap-4"
          >
            <a
              href="#readings"
              className="rounded-xl bg-ink px-7 py-3.5 text-[15px] font-semibold text-paper transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              내 결 읽어보기
            </a>
            <span className="text-sm text-ink-faint">가입 없이 바로</span>
          </motion.div>

          {/* 결과 티저 — 블러 처리된 샘플로 호기심 자극 */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <p className="mb-3 text-[11.5px] tracking-wide text-ink-faint">
              생년월일을 넣으면 이런 결과가 나와요 ↓
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "나의 타고난 인기", value: "상위 14%" },
                { label: "결혼 예상 나이", value: "31세" },
                { label: "운명 상대 유형", value: "말수 적은 실행형" },
                { label: "나와 상대방의 바람기 지수", value: "낮음 / 중간" },
                { label: "궁합 총점", value: "82 / 100" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-full border border-line bg-white/80 px-3.5 py-2 backdrop-blur-sm"
                >
                  <span className="text-[12px] text-ink-faint">{item.label}</span>
                  <span className="select-none text-[12px] font-semibold text-brass blur-[5px]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="hidden justify-end sm:flex">
          <Constellation />
        </div>
      </div>
    </section>
  );
}
