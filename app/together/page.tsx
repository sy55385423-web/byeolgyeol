import type { Metadata } from "next";
import Link from "next/link";
import { IconArrow } from "@/components/ui/icons";
import { personaFromChoice } from "@/lib/persona";
import { PersonaBadge } from "@/components/persona/PersonaCard";
import WeddingCharacter from "@/components/top1/WeddingCharacter";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "우리끼리 — 별:결",
  description: "친구들과 같이 보는 무료 기능. 내 유형 캐릭터와 결혼 순위 게임.",
};

/** 우리끼리 탭.
 *
 *  예전에는 정사각형 카드 두 장을 세로로 쌓았다. 한 장이 화면을 거의 다
 *  차지해서 두 번째 카드는 늘 탭바에 잘린 채로 보였고, 그 아래로는 빈 화면이
 *  길게 남았다. 카드 두 장의 생김새도 서로 무관해서(하나는 진한 갈색, 하나는
 *  분홍 그라데이션) 같은 화면에 있는 것으로 안 보였다.
 *
 *  틀은 하나로 맞추고 안쪽 색만 각자 쓰게 했다. 세로 길이를 줄여 두 장이
 *  한 화면에 들어오게 하고, 아래에 준비 중인 자리를 타일로 놓아 목록이
 *  끝난 게 아니라 이어지는 것으로 읽히게 했다. */

type Tile = {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  art: React.ReactNode;
  /** 카드 바탕 */
  bg: string;
  border: string;
  /** 그 카드에서 쓰는 강조색 */
  accent: string;
  titleColor: string;
  descColor: string;
  chipBg: string;
  /** 아트가 앉는 원형 바탕. 배지는 이미 원이라 투명하게 둔다. */
  artGround: string;
};

function FeatureTile({ t, index }: { t: Tile; index: number }) {
  return (
    <Reveal delay={index * 0.07}>
      <Link
        href={t.href}
        className="group relative flex items-center gap-4 overflow-hidden rounded-[26px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(23,24,28,0.14)] active:scale-[0.99] sm:gap-6 sm:p-6"
        style={{ background: t.bg, borderColor: t.border }}
      >
        <div
          className="flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
          style={{ background: t.artGround }}
        >
          {t.art}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: t.chipBg, color: t.accent }}
            >
              무료
            </span>
            <span
              className="text-[10.5px] font-semibold tracking-[0.14em]"
              style={{ color: t.accent }}
            >
              {t.eyebrow}
            </span>
          </div>
          <h2
            className="mt-2 break-keep font-serif text-[17px] font-bold leading-snug sm:text-[19px]"
            style={{ color: t.titleColor }}
          >
            {t.title}
          </h2>
          <p
            className="mt-1.5 break-keep text-[12.5px] leading-relaxed"
            style={{ color: t.descColor }}
          >
            {t.desc}
          </p>
          <span
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold transition-transform group-hover:translate-x-0.5"
            style={{ color: t.accent }}
          >
            시작하기
            <IconArrow className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export default function TogetherPage() {
  const persona = personaFromChoice(1, "사자자리"); // 불꽃파워 사자 — 캐릭터 예시용

  const tiles: Tile[] = [
    {
      href: "/together/persona",
      eyebrow: "MY 별:결",
      title: "나의 별:결 유형 캐릭터",
      desc: "사주·자미두수·점성술로 내 유형을 찾고, 친구와 궁합을 %로 확인해요.",
      art: <PersonaBadge type={persona.type} size={92} />,
      artGround: "transparent",
      bg: persona.type.badge.dark,
      border: "rgba(183,138,60,0.3)",
      accent: "#c9a45c",
      titleColor: "#faf9f5",
      descColor: "rgba(250,249,245,0.62)",
      chipBg: "rgba(201,164,92,0.18)",
    },
    {
      href: "/together/top1",
      eyebrow: "우리중 TOP1",
      title: "결혼 가장 먼저 하는 사람은?",
      desc: "생년월일로 예상 결혼 나이를 확인하고, 친구들과 순위로 비교해요.",
      art: <WeddingCharacter stage="adult" size={84} />,
      artGround: "rgba(255,255,255,0.62)",
      bg: "linear-gradient(150deg, #ffedf1 0%, #fff6e0 100%)",
      border: "#f3b8c8",
      accent: "#c03a68",
      titleColor: "#17181c",
      descColor: "#55565c",
      chipBg: "rgba(255,255,255,0.75)",
    },
  ];

  return (
    <main className="mx-auto max-w-xl px-5 pb-16 pt-10 sm:pt-14">
      <Reveal>
        <p className="text-xs font-medium tracking-[0.2em] text-brass-ink">TOGETHER</p>
        <h1 className="mt-2.5 font-serif text-[27px] font-semibold leading-tight tracking-tight sm:text-3xl">
          우리끼리
        </h1>
        <p className="mt-3 break-keep text-[13.5px] leading-relaxed text-ink-soft">
          친구들과 같이 보는 자리예요. 여기 있는 것은 전부 무료고, 결과는 링크
          하나로 바로 공유됩니다.
        </p>
      </Reveal>

      <div className="mt-8 space-y-3.5">
        {tiles.map((t, i) => (
          <FeatureTile key={t.href} t={t} index={i} />
        ))}

        {/* 준비 중인 자리. 비워 두면 목록이 끊긴 것처럼 보인다. */}
        <Reveal delay={0.2}>
          <div className="flex items-center gap-4 rounded-[26px] border border-dashed border-line bg-white/40 p-5 sm:gap-6 sm:p-6">
            <div
              className="flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-full border border-dashed border-line text-ink-faint"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10.5px] font-semibold tracking-[0.14em] text-ink-faint">
                준비 중
              </span>
              <h2 className="mt-2 break-keep font-serif text-[17px] font-bold leading-snug text-ink-soft sm:text-[19px]">
                친구들과 같이 볼 것을 더 만들고 있어요
              </h2>
              <p className="mt-1.5 break-keep text-[12.5px] leading-relaxed text-ink-faint">
                단체 궁합, 모임 자리 배치처럼 여럿이 한 번에 보는 것들을 준비하고
                있습니다.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.24}>
        <p className="mt-8 break-keep rounded-2xl border border-line bg-white/50 px-5 py-4 text-[12.5px] leading-relaxed text-ink-soft">
          여기 기능들도 리포트와 같은 명반에서 계산합니다. 재미로 보는 자리지만
          숫자를 지어내지는 않아요.
        </p>
      </Reveal>
    </main>
  );
}
