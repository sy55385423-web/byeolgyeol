"use client";

import { useState } from "react";
import { faqs } from "@/data/site";
import Reveal from "@/components/ui/Reveal";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-line bg-paper-warm/50">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:py-24">
        <Reveal>
          <p className="text-sm font-medium tracking-widest text-brass">FAQ</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
            자주 묻는 질문
          </h2>
        </Reveal>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
                aria-expanded={open === i}
              >
                <span className="pr-4 text-[15px] font-medium">{f.q}</span>
                <span
                  className={`text-lg text-ink-faint transition-transform duration-200 ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  open === i ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <p className="overflow-hidden text-[14px] leading-relaxed text-ink-soft">
                  {f.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
