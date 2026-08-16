"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { compatLabel, compatScore, ELEMENT_OPTIONS, SIGN_OPTIONS, type Element } from "@/lib/persona";
import { birthEntryId, loadMap, resultOfEntry, typeEntryId, upsertEntry, type PersonaMapEntry } from "@/lib/personaMap";
import { PersonaBadge } from "@/components/persona/PersonaCard";

function scoreColor(score: number): string {
  if (score >= 70) return "var(--color-brass)";
  if (score >= 40) return "var(--color-ink-faint)";
  return "var(--color-line)";
}

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-brass";
const centerInputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-center text-[15px] outline-none transition-colors focus:border-brass";
const selectCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-brass";

export default function PersonaMapPage() {
  const [entries, setEntries] = useState<PersonaMapEntry[] | null>(null);
  const [mode, setMode] = useState<"birth" | "type">("birth");

  const [fname, setFname] = useState("");
  const [fy, setFy] = useState("");
  const [fm, setFm] = useState("");
  const [fd, setFd] = useState("");

  const [tname, setTname] = useState("");
  const [tel, setTel] = useState<Element>(0);
  const [tsign, setTsign] = useState(SIGN_OPTIONS[0].value);

  const [error, setError] = useState("");

  useEffect(() => {
    setEntries(loadMap());
  }, []);

  const me = entries?.find((e) => e.isMe);
  const friends = useMemo(() => entries?.filter((e) => !e.isMe) ?? [], [entries]);

  const addByBirth = () => {
    const yy = +fy, mm = +fm, dd = +fd;
    if (yy < 1900 || yy > 2030 || mm < 1 || mm > 12 || dd < 1 || dd > 31) {
      setError("생년월일을 다시 확인해주세요.");
      return;
    }
    setError("");
    const entry: PersonaMapEntry = {
      id: birthEntryId({ y: yy, m: mm, d: dd }),
      name: fname || "친구",
      mode: "birth",
      y: yy,
      m: mm,
      d: dd,
      isMe: false,
      addedAt: Date.now(),
    };
    setEntries(upsertEntry(entry));
    setFname("");
    setFy("");
    setFm("");
    setFd("");
  };

  const addByType = () => {
    if (!tname.trim()) {
      setError("친구 이름을 입력해주세요.");
      return;
    }
    setError("");
    const entry: PersonaMapEntry = {
      id: typeEntryId(tel, tsign, tname),
      name: tname,
      mode: "type",
      element: tel,
      sign: tsign,
      isMe: false,
      addedAt: Date.now(),
    };
    setEntries(upsertEntry(entry));
    setTname("");
  };

  if (entries === null) return null;

  if (!me) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <h1 className="font-serif text-xl font-semibold">궁합 순위</h1>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-ink-soft">
          먼저 내 유형을 확인해야 친구와 궁합을 볼 수 있어요.
        </p>
        <Link
          href="/together/persona"
          className="mt-6 rounded-xl bg-ink px-5 py-3 text-[14.5px] font-semibold text-paper"
        >
          내 유형 확인하러 가기
        </Link>
      </main>
    );
  }

  const myResult = resultOfEntry(me);
  const ranked = friends
    .map((f) => {
      const result = resultOfEntry(f);
      const score = compatScore(myResult, result);
      return { entry: f, result, score };
    })
    .sort((a, b) => b.score - a.score);

  const cx = 160, cy = 170, r = 108;
  const nodes = ranked.map((n, i) => {
    const angle = (i / Math.max(ranked.length, 1)) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <main className="mx-auto max-w-lg px-5 pb-20 pt-10 sm:pt-14">
      <p className="text-sm font-medium tracking-widest text-brass">MATCH</p>
      <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        {me.name}님의 궁합 순위
      </h1>
      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
        친구 생년월일을 입력하거나, 생년월일을 모르면 유형을 직접 선택해서 궁합을 확인하세요. 친구가 내 공유 링크를 열면 자동으로도 추가돼요. 이 목록은 이 기기(브라우저)에만 저장돼요.
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-white/70 p-5">
        <div className="flex gap-1.5 rounded-xl bg-paper-warm p-1">
          <button
            type="button"
            onClick={() => { setMode("birth"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-[13.5px] font-medium transition-colors ${
              mode === "birth" ? "bg-ink text-paper" : "text-ink-soft"
            }`}
          >
            생년월일로
          </button>
          <button
            type="button"
            onClick={() => { setMode("type"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-[13.5px] font-medium transition-colors ${
              mode === "type" ? "bg-ink text-paper" : "text-ink-soft"
            }`}
          >
            유형 선택으로
          </button>
        </div>

        {mode === "birth" ? (
          <div className="mt-4 space-y-3">
            <input
              className={inputCls}
              placeholder="친구 이름 또는 애칭"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
            />
            <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
              <input
                className={centerInputCls}
                placeholder="1998"
                inputMode="numeric"
                maxLength={4}
                value={fy}
                onChange={(e) => setFy(e.target.value.replace(/\D/g, ""))}
              />
              <input
                className={centerInputCls}
                placeholder="03"
                inputMode="numeric"
                maxLength={2}
                value={fm}
                onChange={(e) => setFm(e.target.value.replace(/\D/g, ""))}
              />
              <input
                className={centerInputCls}
                placeholder="14"
                inputMode="numeric"
                maxLength={2}
                value={fd}
                onChange={(e) => setFd(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            {error && <p className="text-[13px] text-red-600">{error}</p>}
            <button
              type="button"
              onClick={addByBirth}
              className="w-full rounded-xl bg-ink px-4 py-3.5 text-[15px] font-semibold text-paper transition-transform active:scale-[0.98]"
            >
              궁합 확인하기
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <input
              className={inputCls}
              placeholder="친구 이름 또는 애칭"
              value={tname}
              onChange={(e) => setTname(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                className={selectCls}
                value={tel}
                onChange={(e) => setTel(Number(e.target.value) as Element)}
              >
                {ELEMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select className={selectCls} value={tsign} onChange={(e) => setTsign(e.target.value)}>
                {SIGN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[12.5px] text-ink-faint">
              친구가 예전에 알려준 유형(예: "야무진 사자")을 그대로 골라도 돼요.
            </p>
            {error && <p className="text-[13px] text-red-600">{error}</p>}
            <button
              type="button"
              onClick={addByType}
              className="w-full rounded-xl bg-ink px-4 py-3.5 text-[15px] font-semibold text-paper transition-transform active:scale-[0.98]"
            >
              궁합 확인하기
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white/70 p-4">
        {nodes.length === 0 ? (
          <div className="flex h-[220px] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-night text-paper">
              <span className="font-serif text-sm font-semibold">{me.name.slice(0, 2)}</span>
            </div>
            <p className="mt-4 max-w-[220px] text-[13px] text-ink-faint">
              아직 친구가 없어요. 위에서 확인해보거나, 유형 결과를 공유해보세요.
            </p>
          </div>
        ) : (
          <svg viewBox="0 0 320 340" className="w-full">
            {nodes.map((n, i) => (
              <line
                key={`l-${i}`}
                x1={cx}
                y1={cy}
                x2={n.x}
                y2={n.y}
                stroke={scoreColor(n.score)}
                strokeWidth={n.score >= 70 ? 2 : 1.25}
                strokeDasharray={n.score < 40 ? "3 3" : undefined}
              />
            ))}
            {nodes.map((n, i) => (
              <g key={`n-${i}`}>
                <circle cx={n.x} cy={n.y} r={24} fill="white" stroke={scoreColor(n.score)} strokeWidth="1.5" />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fill="var(--color-ink)">
                  {n.entry.name.slice(0, 3)}
                </text>
              </g>
            ))}
            <circle cx={cx} cy={cy} r={28} fill="var(--color-night)" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight={600} fill="var(--color-paper)">
              {me.name.slice(0, 3)}
            </text>
          </svg>
        )}
      </div>

      {ranked.length > 0 && (
        <div className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/70">
          {ranked.map((n, i) => (
            <div key={n.entry.id} className="flex items-center gap-3 p-4">
              <span className="w-5 shrink-0 text-center font-serif text-[13px] font-semibold text-ink-faint">
                {i + 1}
              </span>
              <PersonaBadge type={n.result.type} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{n.entry.name}</p>
                <p className="truncate text-[12.5px] text-ink-faint">{n.result.type.name}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-serif text-[17px] font-bold" style={{ color: scoreColor(n.score) }}>
                  {n.score}%
                </p>
                <p className="text-[10.5px] text-ink-faint">{compatLabel(n.score)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/together/persona"
        className="mt-6 block text-center text-[13px] text-ink-faint underline underline-offset-2"
      >
        내 유형 다시 보기 · 공유하기
      </Link>
    </main>
  );
}
