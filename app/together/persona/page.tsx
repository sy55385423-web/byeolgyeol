"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { compatLabel, compatScore, computePersona, decodePersona, encodePersona, type PersonaShare } from "@/lib/persona";
import { birthEntryId, getMe, resultOfEntry, upsertEntry, type PersonaMapEntry } from "@/lib/personaMap";
import PersonaCard from "@/components/persona/PersonaCard";
import { IconArrow } from "@/components/ui/icons";

export default function PersonaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [y, setY] = useState("");
  const [m, setM] = useState("");
  const [d, setD] = useState("");
  const [error, setError] = useState("");

  const [me, setMe] = useState<PersonaMapEntry | null | undefined>(undefined); // undefined = 아직 로드 전
  const [sharedFrom, setSharedFrom] = useState<(PersonaShare & { id: string }) | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMe(getMe() ?? null);
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("p");
    if (raw) {
      const decoded = decodePersona(raw);
      if (decoded) {
        const id = birthEntryId(decoded);
        upsertEntry({
          id,
          name: decoded.n || "친구",
          mode: "birth",
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
    const id = birthEntryId({ y: yy, m: mm, d: dd });
    const entry: PersonaMapEntry = { id, name: name || "나", mode: "birth", y: yy, m: mm, d: dd, isMe: true, addedAt: Date.now() };
    upsertEntry(entry);
    setMe(entry);
  };

  const shareAndViewRanking = async (entry: PersonaMapEntry) => {
    if (entry.mode !== "birth") return;
    const payload: PersonaShare = { y: entry.y, m: entry.m, d: entry.d, h: entry.h, n: entry.name };
    const url = `${window.location.origin}/together/persona?p=${encodePersona(payload)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "별:결 — 나의 유형", url });
        router.push("/together/map");
        return;
      }
    } catch {
      return; // 공유 취소 — 순위 페이지로 넘어가지 않고 그대로 둠
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      router.push("/together/map");
    }, 900);
  };

  if (me === undefined) return null; // 로드 전 깜빡임 방지

  const myResult = me ? resultOfEntry(me) : null;
  const sharedResult = sharedFrom
    ? computePersona({ y: sharedFrom.y, m: sharedFrom.m, d: sharedFrom.d, hourBranch: sharedFrom.h })
    : null;

  return (
    <main className="mx-auto max-w-lg px-5 pb-20 pt-10 sm:pt-14">
      <p className="text-sm font-medium tracking-widest text-brass">MY 별:결</p>
      <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        나는 어떤 결의 사람일까요
      </h1>
      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
        사주(오행)와 점성술(별자리)을 한 번에 계산해서 60가지 유형 중 하나로 알려드려요. 무료이고, 결과는 친구에게 링크로 공유할 수 있어요.
      </p>

      {sharedResult && sharedFrom && (
        <div className="mt-8">
          <p className="text-xs font-medium text-brass">{sharedFrom.n || "친구"}님이 공유한 결과예요</p>
          <div className="mt-3">
            <PersonaCard result={sharedResult} name={sharedFrom.n} />
          </div>
          {myResult && (
            <div className="mt-3 flex items-center gap-4 rounded-xl border border-brass/40 bg-brass-faint/40 p-4">
              <p className="font-serif text-3xl font-bold text-brass">
                {compatScore(myResult, sharedResult)}
                <span className="text-base font-medium">%</span>
              </p>
              <p className="text-[13.5px] text-ink-soft">
                나와의 궁합 —{" "}
                <span className="font-medium text-ink">{compatLabel(compatScore(myResult, sharedResult))}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {!myResult ? (
        <div className="mt-8 space-y-4 rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-[14px] font-medium">{sharedResult ? "나도 내 유형 확인하기" : "생년월일을 알려주세요"}</p>
          <input
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-brass"
            placeholder="이름 또는 애칭 (선택)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
            <input
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-center text-[15px] outline-none transition-colors focus:border-brass"
              placeholder="1998"
              inputMode="numeric"
              maxLength={4}
              value={y}
              onChange={(e) => setY(e.target.value.replace(/\D/g, ""))}
            />
            <input
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-center text-[15px] outline-none transition-colors focus:border-brass"
              placeholder="03"
              inputMode="numeric"
              maxLength={2}
              value={m}
              onChange={(e) => setM(e.target.value.replace(/\D/g, ""))}
            />
            <input
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-center text-[15px] outline-none transition-colors focus:border-brass"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-[15px] font-semibold text-paper transition-transform active:scale-[0.98]"
          >
            내 유형 보기
            <IconArrow className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mt-8">
          <PersonaCard result={myResult} name={me?.name} />
          <div className="mt-4 space-y-2.5">
            <button
              type="button"
              onClick={() => me && shareAndViewRanking(me)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-[14.5px] font-semibold text-paper transition-transform active:scale-[0.98]"
            >
              {copied ? "링크 복사됨" : "카카오톡으로 공유하고 궁합 순위 보기"}
              <IconArrow className="h-4 w-4" />
            </button>
            <Link
              href="/together/map"
              className="flex w-full items-center justify-center rounded-xl border border-line bg-white px-4 py-3.5 text-[14.5px] font-semibold text-ink transition-colors hover:border-brass/50"
            >
              궁합 순위 보기
            </Link>
          </div>
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
