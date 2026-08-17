"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadTop1Map, resultOfEntry, type Top1Entry } from "@/lib/top1Map";
import { IconArrow, IconRing } from "@/components/ui/icons";

export default function Top1RankPage() {
  const [entries, setEntries] = useState<Top1Entry[] | null>(null);

  useEffect(() => {
    setEntries(loadTop1Map());
  }, []);

  if (entries === null) return null;

  const me = entries.find((e) => e.isMe);

  if (!me) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <h1 className="font-serif text-xl font-semibold">우리중 TOP1</h1>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-ink-soft">
          먼저 내 결혼 나이를 확인해야 친구들과 순위를 볼 수 있어요.
        </p>
        <Link
          href="/together/top1"
          className="mt-6 rounded-xl px-5 py-3 text-[14.5px] font-semibold text-white"
          style={{ background: "#e0356b" }}
        >
          내 결혼 나이 확인하러 가기
        </Link>
      </main>
    );
  }

  const ranked = entries
    .map((e) => ({ entry: e, result: resultOfEntry(e) }))
    .sort((a, b) => a.result.marriageAge - b.result.marriageAge);

  return (
    <main className="mx-auto max-w-lg px-5 pb-20 pt-10 sm:pt-14">
      <p className="text-sm font-medium tracking-widest" style={{ color: "#d6467a" }}>우리중 TOP1</p>
      <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        {me.name}님 그룹, 결혼 순위
      </h1>
      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
        친구가 내 공유 링크를 열면 자동으로 순위에 추가돼요. 이 목록은 이 기기(브라우저)에만 저장돼요.
      </p>

      <div
        className="mt-6 divide-y divide-[#e0356b]/10 overflow-hidden rounded-3xl border"
        style={{
          borderColor: "#f3b8c8",
          background: "linear-gradient(160deg, #ffedf1 0%, #fff6e0 100%)",
        }}
      >
        {ranked.map((n, i) => (
          <div key={n.entry.id} className="flex items-center gap-3 p-4">
            {i === 0 ? (
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ background: "#e0356b", color: "#fff" }}
              >
                <IconRing className="h-4 w-4" />
              </span>
            ) : (
              <span className="w-8 shrink-0 text-center font-serif text-[15px] font-bold text-ink-faint">
                {i + 1}
              </span>
            )}
            <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">
              {n.entry.name}
              {n.entry.isMe ? " (나)" : ""}
            </p>
            <p className="shrink-0 font-serif text-[19px] font-bold" style={{ color: "#e0356b" }}>
              {n.result.marriageAge}
              <span className="ml-0.5 text-[12px] font-medium text-ink-soft">세</span>
            </p>
          </div>
        ))}
      </div>

      {ranked.length < 2 && (
        <p className="mt-4 text-center text-[13px] text-ink-faint">
          아직 나 혼자예요. 친구에게 공유해서 순위를 채워보세요.
        </p>
      )}

      <Link
        href="/reading/love/life?goto=birth"
        className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-brass/30 bg-brass-faint/40 px-5 py-4 transition-colors hover:border-brass/60"
      >
        <span className="min-w-0">
          <span className="block text-[13.5px] font-semibold text-ink">내 연애와 관련된 모든 것 보러가기</span>
          <span className="mt-0.5 block text-[11.5px] text-ink-soft">평생 연애 총론 — 매력부터 결혼 시기까지 한번에</span>
        </span>
        <IconArrow className="h-4 w-4 shrink-0 text-brass" />
      </Link>

      <Link
        href="/together/top1"
        className="mt-6 block text-center text-[13px] text-ink-faint underline underline-offset-2"
      >
        내 결혼 나이 다시 보기 · 공유하기
      </Link>
    </main>
  );
}
