"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { decodePersona, encodePersona, type PersonaShare } from "@/lib/persona";
import { computeTop1 } from "@/lib/top1";
import { getTop1Me, top1EntryId, upsertTop1Entry, type Top1Entry } from "@/lib/top1Map";
import Top1Card from "@/components/top1/Top1Card";
import { IconArrow } from "@/components/ui/icons";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-brass";
const centerInputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-center text-[15px] outline-none transition-colors focus:border-brass";

export default function Top1PageClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [y, setY] = useState("");
  const [m, setM] = useState("");
  const [d, setD] = useState("");
  const [error, setError] = useState("");

  const [me, setMe] = useState<Top1Entry | null | undefined>(undefined); // undefined = 아직 로드 전
  const [sharedFrom, setSharedFrom] = useState<(PersonaShare & { id: string }) | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMe(getTop1Me() ?? null);
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("p");
    if (raw) {
      const decoded = decodePersona(raw);
      if (decoded) {
        const id = top1EntryId(decoded);
        upsertTop1Entry({
          id,
          name: decoded.n || "친구",
          y: decoded.y,
          m: decoded.m,
          d: decoded.d,
          h: decoded.h,
          isMe: false,
          addedAt: Date.now(),
        });
        setSharedFrom({ ...decoded, id });
      }
    }
  }, []);

  const submit = () => {
    const yy = +y, mm = +m, dd = +d;
    if (yy < 1900 || yy > 2030 || mm < 1 || mm > 12 || dd < 1 || dd > 31) {
      setError("생년월일을 다시 확인해주세요.");
      return;
    }
    setError("");
    const id = top1EntryId({ y: yy, m: mm, d: dd });
    const entry: Top1Entry = { id, name: name || "나", y: yy, m: mm, d: dd, isMe: true, addedAt: Date.now() };
    upsertTop1Entry(entry);
    setMe(entry);
  };

  const shareAndViewRanking = async (entry: Top1Entry) => {
    const payload: PersonaShare = { y: entry.y, m: entry.m, d: entry.d, h: entry.h, n: entry.name };
    const url = `${window.location.origin}/together/top1?p=${encodePersona(payload)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "별:결 — 우리중 TOP1", url });
        router.push("/together/top1/rank");
        return;
      }
    } catch {
      return; // 공유 취소 — 순위 페이지로 넘어가지 않고 그대로 둠
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      router.push("/together/top1/rank");
    }, 900);
  };

  if (me === undefined) return null; // 로드 전 깜빡임 방지

  const myResult = me ? computeTop1({ y: me.y, m: me.m, d: me.d, hourBranch: me.h }) : null;
  const sharedResult = sharedFrom
    ? computeTop1({ y: sharedFrom.y, m: sharedFrom.m, d: sharedFrom.d, hourBranch: sharedFrom.h })
    : null;

  return (
    <main className="mx-auto max-w-lg px-5 pb-20 pt-10 sm:pt-14">
      <p className="text-sm font-medium tracking-widest" style={{ color: "#d6467a" }}>우리중 TOP1</p>
      <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        우리중 결혼 가장 먼저 하는 사람은?
      </h1>
      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
        생년월일로 예상 결혼 나이를 계산해서 카드로 보여드려요. 무료이고, 친구에게 공유하면 자동으로 순위가 만들어져요.
      </p>

      {sharedResult && sharedFrom && (
        <div className="mt-8">
          <p className="text-xs font-medium" style={{ color: "#d6467a" }}>{sharedFrom.n || "친구"}님이 공유한 결과예요</p>
          <div className="mt-3">
            <Top1Card result={sharedResult} name={sharedFrom.n} />
          </div>
        </div>
      )}

      {!myResult ? (
        <div className="mt-8 space-y-4 rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-[14px] font-medium">{sharedResult ? "나도 내 결혼 나이 확인하기" : "생년월일을 알려주세요"}</p>
          <input
            className={inputCls}
            placeholder="이름 또는 애칭 (선택)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
            <input
              className={centerInputCls}
              placeholder="1998"
              inputMode="numeric"
              maxLength={4}
              value={y}
              onChange={(e) => setY(e.target.value.replace(/\D/g, ""))}
            />
            <input
              className={centerInputCls}
              placeholder="03"
              inputMode="numeric"
              maxLength={2}
              value={m}
              onChange={(e) => setM(e.target.value.replace(/\D/g, ""))}
            />
            <input
              className={centerInputCls}
              placeholder="14"
              inputMode="numeric"
              maxLength={2}
              value={d}
              onChange={(e) => setD(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <p className="text-[12.5px] text-ink-faint">양력 기준이에요. 이 기기에만 저장되고 서버로 전송되지 않아요.</p>
          <button
            type="button"
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
            style={{ background: "#e0356b" }}
          >
            내 결혼 나이 보기
            <IconArrow className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mt-8">
          <Top1Card result={myResult} name={me?.name} />
          <div className="mt-4 space-y-2.5">
            <button
              type="button"
              onClick={() => me && shareAndViewRanking(me)}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[14.5px] font-semibold text-white transition-transform active:scale-[0.98]"
              style={{ background: "#e0356b" }}
            >
              {copied ? "링크 복사됨" : "카카오톡으로 공유하고 순위 보기"}
              <IconArrow className="h-4 w-4" />
            </button>
            <Link
              href="/together/top1/rank"
              className="flex w-full items-center justify-center rounded-xl border px-4 py-3.5 text-[14.5px] font-semibold transition-colors"
              style={{ borderColor: "#f3b8c8", color: "#d6467a", background: "#fff6f8" }}
            >
              순위 보기
            </Link>
          </div>

          <Link
            href="/reading/love/life?goto=birth"
            className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-brass/30 bg-brass-faint/40 px-5 py-4 transition-colors hover:border-brass/60"
          >
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold text-ink">내 연애와 관련된 모든 것 보러가기</span>
              <span className="mt-0.5 block text-[11.5px] text-ink-soft">평생 연애 총론 — 매력부터 결혼 시기까지 한번에</span>
            </span>
            <IconArrow className="h-4 w-4 shrink-0 text-brass" />
          </Link>

          <button
            type="button"
            onClick={() => setMe(null)}
            className="mt-3 w-full text-center text-[12.5px] text-ink-faint underline underline-offset-2"
          >
            다른 생년월일로 다시 하기
          </button>
        </div>
      )}
    </main>
  );
}
