"use client";

import { motion } from "framer-motion";
import { worries } from "@/data/site";

/** 말풍선 고민 섹션 — 공감으로 시작해 카테고리 차트로 연결 */
export default function Bubbles() {
  return (
    <section className="border-y border-line bg-paper-warm/50">
      <div className="mx-auto max-w-2xl px-5 py-20 sm:py-24">
        <p className="text-center text-sm font-medium tracking-widest text-brass">WORRIES</p>
        <h2 className="mt-3 text-center font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          당신의 고민,
          <br />
          어디쯤인가요
        </h2>
        <div className="mt-12 space-y-4">
          {worries.map((w, i) => (
            <motion.div
              key={w.text}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${w.side === "right" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-[0_2px_12px_rgba(23,24,28,0.05)] ${
                  w.side === "right"
                    ? "rounded-br-md bg-night text-paper"
                    : "rounded-bl-md border border-line bg-white text-ink"
                }`}
              >
                {w.text}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="font-serif text-lg leading-relaxed text-ink-soft">
            다 다른 고민 같지만,
            <br />
            답은 전부 당신의 명반 안에 있습니다.
          </p>
          <a
            href="#readings"
            className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 text-[14px] font-semibold text-paper transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            내 고민에 맞는 리딩 찾기
          </a>
        </motion.div>
      </div>
    </section>
  );
}
