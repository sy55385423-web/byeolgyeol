"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Category } from "@/data/categories";
import { encodeOrder, type Order } from "@/lib/order";
import { hourBranchFromLabel, computeChart } from "@/lib/saju";
import { radarStats, values, type Ctx, type ReportInput } from "@/lib/report";
import { IconCheck } from "@/components/ui/icons";
import StatGrid from "@/components/ui/StatGrid";
import SajuCharts from "@/components/ui/SajuCharts";
import RadarCard from "@/components/ui/RadarCard";

/* ---------- 타입 ---------- */

type Person = {
  calendar: "solar" | "lunar";
  y: string;
  m: string;
  d: string;
  knowsTime: boolean;
  time: string;
  /** 정확한 시각을 알 때 — 진태양시 보정에 쓴다 */
  hh: string;
  mm: string;
  /** 출생지(경도) — 같은 시각이라도 지역에 따라 시주가 갈릴 수 있다 */
  city: string;
  gender: "" | "male" | "female" | "none";
};

const emptyPerson = (): Person => ({
  calendar: "solar",
  y: "",
  m: "",
  d: "",
  knowsTime: false,
  time: "",
  hh: "",
  mm: "",
  city: "서울",
  gender: "",
});

type Phase = "form" | "loading" | "preview";

/** 출생지 경도 — 진태양시 보정에 쓴다. 한국 표준시는 동경 135도 기준인데
 *  실제 한반도는 126~130도라, 지역에 따라 실제 태양시가 20~35분 어긋난다. */
const CITIES: { name: string; lon: number }[] = [
  { name: "서울", lon: 126.978 }, { name: "인천", lon: 126.705 }, { name: "수원", lon: 127.029 },
  { name: "춘천", lon: 127.734 }, { name: "강릉", lon: 128.876 }, { name: "대전", lon: 127.385 },
  { name: "청주", lon: 127.489 }, { name: "전주", lon: 127.148 }, { name: "광주", lon: 126.852 },
  { name: "대구", lon: 128.601 }, { name: "울산", lon: 129.311 }, { name: "부산", lon: 129.075 },
  { name: "제주", lon: 126.532 }, { name: "해외·모름", lon: 127.5 },
];

const HOURS = [
  "자시 (23:30~01:29)", "축시 (01:30~03:29)", "인시 (03:30~05:29)", "묘시 (05:30~07:29)",
  "진시 (07:30~09:29)", "사시 (09:30~11:29)", "오시 (11:30~13:29)", "미시 (13:30~15:29)",
  "신시 (15:30~17:29)", "유시 (17:30~19:29)", "술시 (19:30~21:29)", "해시 (21:30~23:29)",
];

/** 입력한 사람 정보를 명반 계산 입력으로 바꾼다.
 *
 *  정확한 시각을 넣었으면 그 시각과 출생지 경도를 넘겨 진태양시로 보정하고,
 *  시진만 골랐으면 그 시진의 한가운데 시각으로 계산한다. */
const birthOf = (p: Person) => {
  const exact = p.hh !== "" && p.hh !== undefined;
  const h = exact ? Math.min(23, Math.max(0, +p.hh || 0)) : undefined;
  const mi = exact ? Math.min(59, Math.max(0, +p.mm || 0)) : undefined;
  return {
    y: +p.y, m: +p.m, d: +p.d,
    hourBranch: exact ? Math.floor(((h! + 1) % 24) / 2) : p.knowsTime ? hourBranchFromLabel(p.time) : undefined,
    hour: h,
    minute: mi,
    lon: exact ? CITIES.find((c) => c.name === p.city)?.lon : undefined,
    gender: p.gender || undefined,
  };
};

/** 공유 링크에 실을 형태. birthOf와 같은 값을 짧은 키로 담는다. */
const orderPersonOf = (p: Person) => {
  const b = birthOf(p);
  return { y: b.y, m: b.m, d: b.d, h: b.hourBranch, hh: b.hour, mi: b.minute, lo: b.lon, g: b.gender };
};

const formatBirth = (p: Person) => {
  if (!(+p.y >= 1900 && +p.y <= 2030 && +p.m >= 1 && +p.m <= 12 && +p.d >= 1 && +p.d <= 31)) return "입력 안 됨";
  return `${p.y}년 ${p.m}월 ${p.d}일 (${p.calendar === "solar" ? "양력" : "음력"})`;
};
const formatTime = (p: Person) =>
  p.hh !== ""
    ? `${p.hh.padStart(2, "0")}:${(p.mm || "0").padStart(2, "0")} · ${p.city}`
    : p.knowsTime
      ? p.time || "선택 안 됨"
      : "모름";
const formatGender = (g: Person["gender"]) =>
  g === "male" ? "남성" : g === "female" ? "여성" : g === "none" ? "밝히지 않음" : "입력 안 됨";

/* ---------- 작은 부품 ---------- */

function SummaryRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3.5 last:border-b-0">
      <div>
        <p className="text-xs text-ink-faint">{label}</p>
        <p className="mt-0.5 text-[15px] text-ink">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-soft transition-colors hover:border-ink-faint"
      >
        수정
      </button>
    </div>
  );
}

function Toggle({
  options,
  value,
  onChange,
}: {
  options: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`flex-1 rounded-xl border px-4 py-3.5 text-[15px] font-medium transition-all active:scale-[0.98] ${
            value === o.v
              ? "border-ink bg-ink text-paper"
              : "border-line bg-white text-ink-soft hover:border-ink-faint"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function BirthInputs({ p, set }: { p: Person; set: (patch: Partial<Person>) => void }) {
  const inputCls =
    "w-full rounded-xl border border-line bg-white px-4 py-3.5 text-center text-[16px] outline-none transition-colors focus:border-brass";
  return (
    <div className="space-y-4">
      <Toggle
        options={[
          { v: "solar", label: "양력" },
          { v: "lunar", label: "음력" },
        ]}
        value={p.calendar}
        onChange={(v) => set({ calendar: v as Person["calendar"] })}
      />
      <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
        <input
          className={inputCls}
          placeholder="1998"
          inputMode="numeric"
          maxLength={4}
          value={p.y}
          onChange={(e) => set({ y: e.target.value.replace(/\D/g, "") })}
        />
        <input
          className={inputCls}
          placeholder="03"
          inputMode="numeric"
          maxLength={2}
          value={p.m}
          onChange={(e) => set({ m: e.target.value.replace(/\D/g, "") })}
        />
        <input
          className={inputCls}
          placeholder="14"
          inputMode="numeric"
          maxLength={2}
          value={p.d}
          onChange={(e) => set({ d: e.target.value.replace(/\D/g, "") })}
        />
      </div>
      <p className="text-[13px] text-ink-faint">
        생년월일은 명반 계산에만 사용하고, 다른 목적으로 쓰지 않아요.
      </p>
    </div>
  );
}

function TimeInputs({ p, set }: { p: Person; set: (patch: Partial<Person>) => void }) {
  return (
    <div className="space-y-4">
      <Toggle
        options={[
          { v: "exact", label: "정확히 알아요" },
          { v: "approx", label: "대략 알아요" },
          { v: "no", label: "몰라요" },
        ]}
        value={p.hh !== "" ? "exact" : p.knowsTime ? "approx" : "no"}
        onChange={(v) =>
          set(
            v === "exact"
              ? { knowsTime: true, time: "", hh: p.hh || "12", mm: p.mm || "00" }
              : v === "approx"
                ? { knowsTime: true, hh: "", mm: "" }
                : { knowsTime: false, time: "", hh: "", mm: "" },
          )
        }
      />

      {p.hh !== "" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              value={p.hh}
              onChange={(e) => set({ hh: e.target.value.replace(/\D/g, "").slice(0, 2) })}
              inputMode="numeric"
              maxLength={2}
              placeholder="14"
              aria-label="태어난 시"
              className="w-20 rounded-lg border border-line bg-white px-3 py-2.5 text-center text-[15px] outline-none focus:border-ink"
            />
            <span className="text-ink-soft">시</span>
            <input
              value={p.mm}
              onChange={(e) => set({ mm: e.target.value.replace(/\D/g, "").slice(0, 2) })}
              inputMode="numeric"
              maxLength={2}
              placeholder="30"
              aria-label="태어난 분"
              className="w-20 rounded-lg border border-line bg-white px-3 py-2.5 text-center text-[15px] outline-none focus:border-ink"
            />
            <span className="text-ink-soft">분</span>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] text-ink-soft">태어난 지역</p>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => set({ city: c.name })}
                  className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-all active:scale-[0.98] ${
                    p.city === c.name
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-white text-ink-soft hover:border-ink-faint"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-faint">
            한국 표준시는 동경 135도를 기준으로 하는데 한반도는 126~130도에 있습니다. 그래서 시계
            시각과 실제 태양의 위치가 20~35분 어긋나고, 지역마다 그 차이가 다릅니다. 시주 경계에
            걸친 시각일수록 이 보정이 결과를 바꿉니다.
          </p>
        </div>
      )}

      {p.knowsTime && p.hh === "" && (
        <div className="grid grid-cols-2 gap-2">
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => set({ time: h })}
              className={`rounded-lg border px-3 py-2.5 text-[13px] transition-all active:scale-[0.98] ${
                p.time === h
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-white text-ink-soft hover:border-ink-faint"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      )}
      {!p.knowsTime && (
        <p className="text-[13px] text-ink-faint">
          괜찮아요. 시간 없이도 핵심 흐름은 충분히 읽을 수 있어요.
        </p>
      )}
    </div>
  );
}

/* ---------- 메인 플로우 ---------- */

export default function Flow({ category }: { category: Category }) {
  const [phase, setPhase] = useState<Phase>("form");
  const [stepIdx, setStepIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [me, setMe] = useState<Person>(emptyPerson());
  const [partner, setPartner] = useState<Person>(emptyPerson());
  // 재회 카테고리는 언제 헤어졌는지를 알아야 마음 정리·연락·재회 시기를 잴 수 있다.
  // 이별은 사건이고, 그 뒤로 몇 달이 지났느냐가 답을 완전히 바꾼다.
  const [buY, setBuY] = useState("");
  const [buM, setBuM] = useState("");
  const needsBreakup = category.id === "love-reunion";
  const buValid = (() => {
    const y = +buY, m = +buM;
    if (!(y >= 1980 && y <= 2100 && m >= 1 && m <= 12)) return false;
    const now = new Date();
    return y * 12 + m <= now.getFullYear() * 12 + (now.getMonth() + 1); // 미래는 이별일 수 없다
  })();
  const breakup = needsBreakup && buValid ? { y: +buY, m: +buM } : undefined;

  const setMeP = (patch: Partial<Person>) => setMe((p) => ({ ...p, ...patch }));
  const setPartnerP = (patch: Partial<Person>) => setPartner((p) => ({ ...p, ...patch }));

  const goTo = (idx: number) => {
    setDir(idx < stepIdx ? -1 : 1);
    setStepIdx(idx);
  };

  const validBirth = (p: Person) => {
    const y = +p.y, m = +p.m, d = +p.d;
    return y >= 1900 && y <= 2030 && m >= 1 && m <= 12 && d >= 1 && d <= 31;
  };

  type Step = {
    key: string;
    title: string;
    sub?: string;
    optional?: boolean;
    valid: boolean;
    body: React.ReactNode;
  };

  const steps: Step[] = useMemo(() => {
    const s: Step[] = [
      {
        key: "name",
        title: "어떻게 불러드릴까요?",
        sub: "이름이나 애칭, 편한 쪽으로요.",
        optional: true,
        valid: true,
        body: (
          <input
            className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-[16px] outline-none transition-colors focus:border-brass"
            placeholder="이름 또는 애칭 (건너뛰어도 돼요)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ),
      },
      {
        key: "birth",
        title: "생년월일을 알려주세요",
        sub: "여기서부터 명반이 세워져요.",
        valid: validBirth(me),
        body: <BirthInputs p={me} set={setMeP} />,
      },
      {
        key: "time",
        title: "태어난 시간을 아시나요?",
        sub: "알면 더 정밀해지고, 몰라도 진행할 수 있어요.",
        valid: !me.knowsTime || me.hh !== "" || me.time !== "",
        body: <TimeInputs p={me} set={setMeP} />,
      },
      {
        key: "gender",
        title: "성별을 알려주세요",
        valid: me.gender !== "",
        body: (
          <Toggle
            options={[
              { v: "male", label: "남성" },
              { v: "female", label: "여성" },
              { v: "none", label: "밝히지 않음" },
            ]}
            value={me.gender}
            onChange={(v) => setMeP({ gender: v as Person["gender"] })}
          />
        ),
      },
    ];
    if (category.needsPartner) {
      s.push(
        {
          key: "p-name",
          title: "그 사람의 이름도 알려주세요",
          sub: "리포트에서 본인 내용과 확실히 구분해서 보여드릴게요.",
          optional: true,
          valid: true,
          body: (
            <input
              className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-[16px] outline-none transition-colors focus:border-brass"
              placeholder="상대방 이름 또는 애칭 (건너뛰어도 돼요)"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
            />
          ),
        },
        {
          key: "p-birth",
          title: "그 사람의 생년월일은요?",
          sub: "아는 범위까지만 입력해도 괜찮아요.",
          valid: validBirth(partner),
          body: <BirthInputs p={partner} set={setPartnerP} />,
        },
        {
          key: "p-time",
          title: "그 사람이 태어난 시간은요?",
          valid: !partner.knowsTime || partner.hh !== "" || partner.time !== "",
          body: <TimeInputs p={partner} set={setPartnerP} />,
        },
        {
          key: "p-gender",
          title: "그 사람의 성별은요?",
          valid: partner.gender !== "",
          body: (
            <Toggle
              options={[
                { v: "male", label: "남성" },
                { v: "female", label: "여성" },
                { v: "none", label: "밝히지 않음" },
              ]}
              value={partner.gender}
              onChange={(v) => setPartnerP({ gender: v as Person["gender"] })}
            />
          ),
        }
      );
    }
    if (needsBreakup) {
      s.push({
        key: "breakup",
        title: "두 분은 언제 헤어졌나요?",
        sub: "이별 시점을 기준으로 마음이 정리되는 시기와 연락 타이밍을 계산해요.",
        valid: buValid,
        body: (
          <div className="space-y-2.5">
            <div className="grid grid-cols-[1.4fr_1fr] gap-2">
              <input
                className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-center text-[16px] outline-none transition-colors focus:border-brass"
                placeholder="2024"
                inputMode="numeric"
                maxLength={4}
                value={buY}
                onChange={(e) => setBuY(e.target.value.replace(/\D/g, ""))}
              />
              <input
                className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-center text-[16px] outline-none transition-colors focus:border-brass"
                placeholder="03"
                inputMode="numeric"
                maxLength={2}
                value={buM}
                onChange={(e) => setBuM(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <p className="text-xs text-ink-soft">
              정확한 날짜까지는 몰라도 괜찮아요. 그달 즈음이면 충분합니다.
            </p>
          </div>
        ),
      });
    }
    const nameIdx = 0, birthIdx = 1, timeIdx = 2, genderIdx = 3;
    const pNameIdx = 4, pBirthIdx = 5, pTimeIdx = 6, pGenderIdx = 7;
    const buIdx = 8;
    s.push({
      key: "confirm",
      title: "입력하신 정보가 맞나요?",
      sub: "이 정보로 명반을 세워요. 틀린 부분이 있으면 수정해주세요.",
      valid: true,
      body: (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <SummaryRow label="이름/애칭" value={name || "입력 안 함"} onEdit={() => goTo(nameIdx)} />
          <SummaryRow label="생년월일" value={formatBirth(me)} onEdit={() => goTo(birthIdx)} />
          <SummaryRow label="태어난 시간" value={formatTime(me)} onEdit={() => goTo(timeIdx)} />
          <SummaryRow label="성별" value={formatGender(me.gender)} onEdit={() => goTo(genderIdx)} />
          {category.needsPartner && (
            <>
              <SummaryRow label="상대방 이름/애칭" value={partnerName || "입력 안 함"} onEdit={() => goTo(pNameIdx)} />
              <SummaryRow label="상대방 생년월일" value={formatBirth(partner)} onEdit={() => goTo(pBirthIdx)} />
              <SummaryRow label="상대방 태어난 시간" value={formatTime(partner)} onEdit={() => goTo(pTimeIdx)} />
              <SummaryRow label="상대방 성별" value={formatGender(partner.gender)} onEdit={() => goTo(pGenderIdx)} />
            </>
          )}
          {needsBreakup && (
            <SummaryRow label="헤어진 시기" value={buValid ? `${buY}년 ${buM}월` : "입력 안 함"} onEdit={() => goTo(buIdx)} />
          )}
        </div>
      ),
    });
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, partnerName, me, partner, category.needsPartner, needsBreakup, buY, buM, buValid]);

  // 외부에서 "?goto=birth"로 들어오면 이름 입력을 건너뛰고 생년월일 단계로 바로 이동
  // (예: 우리중 TOP1에서 "내 연애와 관련된 모든 것 보러가기" 버튼)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("goto") === "birth") {
      const idx = steps.findIndex((s) => s.key === "birth");
      if (idx > 0) goTo(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 실제 명반(사주엔진) 기반 컨텍스트 — 생년월일이 유효할 때만 계산됨
  const chartCtx: Ctx | null = useMemo(() => {
    if (!validBirth(me)) return null;
    if (category.needsPartner && !validBirth(partner)) return null;
    const meChart = computeChart(birthOf(me));
    const ptChart = category.needsPartner ? computeChart(birthOf(partner)) : undefined;
    const input: ReportInput = {
      categoryId: category.id,
      name: name || undefined,
      me: birthOf(me),
      partner: category.needsPartner ? birthOf(partner) : undefined,
      partnerName: category.needsPartner ? partnerName || undefined : undefined,
      breakup,
      tier: "basic",
    };
    return { me: meChart, pt: ptChart, c: category, input };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, partner, partnerName, category, name, breakup?.y, breakup?.m]);

  // 미리보기 값 — 전부 실제 명반 엔진(values())에서 가져온다.
  //
  // 예전에는 revealed 항목 하나만 실제 값이고 나머지 아홉은 data/categories.ts의
  // 고정 샘플이었다. 누가 보든 "차분한 리더형 · 4회 · 31세"가 blur 뒤에 있었고,
  // 결제하면 전혀 다른 값이 나왔다. 미리보기가 그 사람 것이 아니면 보여줄 이유가 없다.
  const previewStats = useMemo(() => {
    const base = category.previewStats;
    if (!base) return undefined;
    if (!chartCtx) return base;
    const v = values(chartCtx);
    return base.map((s) => {
      const got = v[s.label];
      // 엔진이 답을 못 내는 항목은 원래 샘플을 둔다(빈칸보다는 낫다).
      if (!got?.v) return s;
      return { ...s, value: got.v, gauge: got.gauge ?? s.gauge };
    });
  }, [chartCtx, category.previewStats]);

  const progress = stepIdx / steps.length;
  const checkedCount = Math.round(progress * category.questions.length);
  const isLast = stepIdx === steps.length - 1;
  const step = steps[stepIdx];

  const next = () => {
    if (!step.valid) return;
    if (isLast) {
      setPhase("loading");
    } else {
      setDir(1);
      setStepIdx((i) => i + 1);
    }
  };
  const back = () => {
    if (stepIdx === 0) return;
    setDir(-1);
    setStepIdx((i) => i - 1);
  };

  const router = useRouter();
  const [checkout, setCheckout] = useState<null | "basic">(null);
  const [paying, setPaying] = useState(false);
  const orderOf = (): Order => ({
    c: category.id,
    n: name || undefined,
    me: orderPersonOf(me),
    pt: category.needsPartner ? orderPersonOf(partner) : undefined,
    bu: breakup,
    pn: category.needsPartner ? partnerName || undefined : undefined,
    t: "basic",
  });
  const pay = async () => {
    const order = orderOf();
    const reportId = encodeOrder(order);
    const amount = category.price;

    if (!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY) {
      // 개발 환경: 모의 결제 (NEXT_PUBLIC_TOSS_CLIENT_KEY 미설정 시)
      setPaying(true);
      setTimeout(() => router.push(`/report/${reportId}`), 1200);
      return;
    }

    setPaying(true);
    try {
      const orderId = `bz${Date.now().toString(36)}`;
      const { loadTossPayments, ANONYMOUS } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: amount },
        orderId,
        orderName: `별:결 ${category.name}`,
        successUrl: `${window.location.origin}/payment/success?reportId=${encodeURIComponent(reportId)}&orderId=${orderId}&amount=${amount}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch {
      setPaying(false);
    }
  };

  /* 리포트 링크 공유/복사 */
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `별:결 — ${category.name}`, url });
        return;
      }
    } catch {
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* 사회적 증거 토스트 — ⚠️ 실시간 데이터 연동 전 플레이스홀더 */
  const [toast, setToast] = useState(false);
  useEffect(() => {
    if (phase !== "form") return;
    const show = setTimeout(() => setToast(true), 6000);
    const hide = setTimeout(() => setToast(false), 11000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [phase]);

  /* 로딩 연출 */
  const [loadStep, setLoadStep] = useState(0);
  useEffect(() => {
    if (phase !== "loading") return;
    setLoadStep(0);
    const timers = category.loadingSteps.map((_, i) =>
      setTimeout(() => setLoadStep(i + 1), (i + 1) * 1400)
    );
    const done = setTimeout(
      () => setPhase("preview"),
      category.loadingSteps.length * 1400 + 800
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [phase, category.loadingSteps]);

  const stage = phase === "form" ? 0 : phase === "loading" ? 1 : 2;

  return (
    <div className="min-h-dvh bg-paper">
      {/* 상단 바 + 진행 단계 */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
          <Link href="/" className="font-serif text-lg font-semibold">
            별:결
          </Link>
          <ol className="flex items-center gap-2 text-xs">
            {["정보 입력", "분석", "리포트"].map((label, i) => (
              <li key={label} className="flex items-center gap-2">
                {i > 0 && <span className="h-px w-4 bg-line" />}
                <span
                  className={
                    i === stage
                      ? "font-semibold text-ink"
                      : i < stage
                        ? "text-brass"
                        : "text-ink-faint"
                  }
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>
        </div>
        {phase === "form" && (
          <div className="h-0.5 bg-line">
            <motion.div
              className="h-full bg-brass"
              animate={{ width: `${Math.max(progress * 100, 4)}%` }}
              transition={{ ease: "easeOut", duration: 0.4 }}
            />
          </div>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24">
        {phase === "form" && (
          <>
            {/* 리딩 소개 + 질문 체크리스트 */}
            <div className="pt-8">
              <h1 className="font-serif text-2xl font-semibold">{category.name}</h1>
              <div className="mt-4 rounded-2xl border border-line bg-white/70 p-5">
                <p className="mb-3 text-xs font-medium text-ink-faint">
                  이 리딩이 답하는 질문 · 입력할수록 채워져요
                </p>
                <ul className="space-y-2">
                  {category.questions.map((q, i) => {
                    const on = i < checkedCount;
                    return (
                      <li key={q} className="flex items-center gap-2.5 text-[13.5px]">
                        <motion.span
                          initial={false}
                          animate={{
                            backgroundColor: on ? "#b78a3c" : "#ffffff",
                            borderColor: on ? "#b78a3c" : "#e7e4dc",
                          }}
                          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border text-paper"
                        >
                          {on && <IconCheck className="h-2.5 w-2.5" />}
                        </motion.span>
                        <span className={on ? "text-ink" : "text-ink-faint"}>{q}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* 스텝 폼 — 한 번에 하나씩 */}
            <div className="relative mt-8 overflow-hidden">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.section
                  key={step.key}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -32 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-xs text-ink-faint">
                    {stepIdx + 1} / {steps.length}
                  </p>
                  <h2 className="mt-2 font-serif text-[22px] font-semibold">{step.title}</h2>
                  {step.sub && <p className="mt-1.5 text-sm text-ink-soft">{step.sub}</p>}
                  <div className="mt-6">{step.body}</div>
                </motion.section>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center gap-3">
              {stepIdx > 0 && (
                <button
                  onClick={back}
                  className="rounded-xl border border-line bg-white px-5 py-3.5 text-[15px] text-ink-soft transition-colors hover:border-ink-faint"
                >
                  이전
                </button>
              )}
              <button
                onClick={next}
                disabled={!step.valid}
                className="flex-1 rounded-xl bg-ink py-3.5 text-[15px] font-semibold text-paper transition-all enabled:hover:scale-[1.01] enabled:active:scale-[0.99] disabled:opacity-30"
              >
                {isLast
                  ? "확인하고 계속하기"
                  : step.optional && !name && step.key === "name"
                    ? "건너뛰기"
                    : "다음"}
              </button>
            </div>
          </>
        )}

        {phase === "loading" && (
          <div className="flex min-h-[70dvh] flex-col items-center justify-center">
            <motion.div
              className="h-10 w-10 rounded-full border border-brass"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <div className="mt-10 space-y-3.5">
              {category.loadingSteps.map((s, i) => {
                const done = i < loadStep;
                const active = i === loadStep;
                return (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: done || active ? 1 : 0.25, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-[15px]"
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                        done
                          ? "border-brass bg-brass text-paper"
                          : "border-line text-transparent"
                      }`}
                    >
                      {done && <IconCheck className="h-3 w-3" />}
                    </span>
                    <span className={done ? "text-ink-faint line-through decoration-line" : active ? "text-ink" : "text-ink-faint"}>
                      {s}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {phase === "preview" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="pt-10"
          >
            <p className="text-sm font-medium tracking-widest text-brass">READING COMPLETE</p>
            <h1 className="mt-3 font-serif text-2xl font-semibold leading-snug">
              {name ? `${name} 님의` : "당신의"} {category.name}이 완성됐어요
            </h1>

            {/* 명반 3표 */}
            <div className="mt-8 rounded-2xl border border-line bg-paper-warm/50 p-4 sm:p-5">
              <SajuCharts
                me={{
                  y: +me.y,
                  m: +me.m,
                  d: +me.d,
                  knowsTime: me.knowsTime,
                  timeLabel: me.time || undefined,
                  hour: birthOf(me).hour,
                  minute: birthOf(me).minute,
                  lon: birthOf(me).lon,
                  gender: me.gender || undefined,
                }}
                name={name || undefined}
              />
            </div>

            {/* 종합 지수 + 레이더 */}
            {chartCtx && (
              <div className="mt-6">
                <RadarCard stats={radarStats(chartCtx)} />
              </div>
            )}

            {previewStats ? (
              <>
                {/* 카드뉴스형 미리보기 — 전 항목 기본 포함, 수치만 가림 */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-medium text-brass">
                      리포트 미리보기 · 수치만 가려져 있어요
                    </p>
                    <p className="text-xs text-ink-faint">
                      전체 {previewStats.length}개 항목
                    </p>
                  </div>
                  <StatGrid
                    stats={previewStats}
                    name={name || undefined}
                    partnerName={partnerName || undefined}
                  />
                </div>
              </>
            ) : (
              <>
                {/* 핵심 결과 부분 공개 */}
                <div className="mt-8 rounded-2xl border border-brass/40 bg-white p-6">
                  <p className="text-xs font-medium text-brass">핵심 문장 미리보기</p>
                  <p className="mt-3 font-serif text-[19px] leading-relaxed">
                    "{category.previewLine}"
                  </p>
                </div>

                {/* 잠긴 전체 항목 */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white/70">
                  <ul className="divide-y divide-line">
                    {category.questions.map((q, i) => (
                      <li key={q} className="flex items-center justify-between px-5 py-4 text-[14.5px]">
                        <span className={i === 0 ? "text-ink" : "text-ink-faint"}>{q}</span>
                        {i === 0 ? (
                          <span className="text-xs font-medium text-brass">공개됨</span>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="5" y="11" width="14" height="9" rx="2" />
                            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                          </svg>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* 결제 버튼 */}
            <button
              onClick={() => setCheckout("basic")}
              className="mt-6 w-full rounded-2xl border border-line bg-white p-5 text-left transition-all hover:border-ink-faint active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-faint">
                    {category.tier === "deep" ? "기본 리포트" : "컴팩트 리포트"}
                  </p>
                  <p className="mt-1.5 font-serif text-2xl font-bold">
                    {category.price.toLocaleString("ko-KR")}원
                  </p>
                </div>
                <div className="text-right text-[12.5px] leading-relaxed text-ink-soft">
                  {category.tier === "deep" ? (
                    <>
                      {category.questions.length}개 항목 초상세 풀이
                      <br />
                      리뷰 작성 시 추가 질문 1회
                    </>
                  ) : (
                    <>
                      핵심만 담은 요약 리딩
                      <br />
                      리뷰 작성 시 추가 질문 1회
                    </>
                  )}
                </div>
              </div>
            </button>
            <p className="mt-4 text-center text-[13px] text-ink-soft">
              리뷰 작성 시 <span className="font-semibold text-ink">추가 질문 1회</span> 무료 ·{" "}
              리포트는 링크로 저장돼 언제든 다시 볼 수 있어요
            </p>
            <button
              onClick={share}
              className="mx-auto mt-3 flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-[13px] text-ink-soft transition-colors hover:border-ink-faint"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="17" cy="6" r="2.5" />
                <circle cx="17" cy="18" r="2.5" />
                <path d="M8.3 10.8 14.7 7.2M8.3 13.2l6.4 3.6" />
              </svg>
              {copied ? "링크가 복사됐어요" : "리포트 공유하기"}
            </button>
          </motion.div>
        )}
      </main>

      {/* 결제 모달 */}
      <AnimatePresence>
        {checkout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
            onClick={() => !paying && setCheckout(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
              className="w-full max-w-md rounded-2xl bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-lg font-semibold">주문 확인</h3>
              <div className="mt-4 space-y-2.5 rounded-xl bg-paper-warm/60 p-4 text-[13.5px]">
                <div className="flex justify-between">
                  <span className="text-ink-soft">{category.name}</span>
                  <span className="font-medium">
                    {category.tier === "deep" ? "기본 리포트" : "컴팩트 리포트"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-line pt-2.5">
                  <span className="text-ink-soft">결제 금액</span>
                  <span className="font-serif text-lg font-bold">
                    {category.price.toLocaleString("ko-KR")}원
                  </span>
                </div>
                <p className="text-xs text-ink-faint">
                  리뷰 작성 시 추가 질문 1회 무료 · 리포트는 링크로 영구 보관
                </p>
              </div>
              <button
                onClick={() => pay()}
                disabled={paying}
                className="mt-5 w-full rounded-xl bg-ink py-3.5 text-[15px] font-semibold text-paper transition-all enabled:hover:scale-[1.01] enabled:active:scale-[0.99] disabled:opacity-60"
              >
                {paying ? "결제 처리 중…" : "결제하기"}
              </button>
              <p className="mt-2.5 text-center text-[11px] text-ink-faint">
                카드·간편결제 등 모든 수단으로 결제할 수 있어요
              </p>
              {!paying && (
                <button
                  onClick={() => setCheckout(null)}
                  className="mt-1 w-full py-2 text-center text-[13px] text-ink-faint hover:text-ink"
                >
                  닫기
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 사회적 증거 토스트 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 rounded-xl border border-line bg-white px-4 py-3 text-[13px] text-ink-soft shadow-[0_8px_30px_rgba(23,24,28,0.1)]"
          >
            조금 전 다른 분이 <span className="font-medium text-ink">{category.name}</span> 리포트를 확인했어요
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
