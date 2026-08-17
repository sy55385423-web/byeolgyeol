/** 우리중 TOP1 — "우리 중 결혼 가장 먼저 하는 사람은?"
 *  나이 자체는 lib/report.ts의 유료 리포트(values())가 쓰는 것과 똑같은 공식으로 계산해서,
 *  나중에 실제 리포트를 사도 여기서 본 숫자와 같은 값이 나오도록 맞춘다. */

import { computeChart, type Birth } from "./saju";

export const MIN_AGE = 26;
export const MAX_AGE = 38;

export type LifeStage = "baby" | "student" | "adult" | "elder";

export type Top1Result = {
  marriageAge: number; // 결혼 예상 나이 (26~38세) — 어릴수록(빠를수록) 1등
  sun: string; // 태양궁(별자리) — 카드 설명 문구용
  seed: number;
};

/** 시드 하나로 결혼 예상 나이를 정하는 단일 공식 — lib/report.ts의 유료 리포트("결혼 예상 나이"
 *  질문)도 이 함수를 그대로 가져다 쓴다. 공식이 두 곳에 따로 있으면 나중에 한쪽만 고쳤을 때
 *  같은 사람인데 무료 카드와 유료 리포트의 나이가 서로 달라지는 사고가 난다(실제로 났었다). */
export function marriageAgeFromSeed(seed: number): number {
  return MIN_AGE + (seed % (MAX_AGE - MIN_AGE + 1));
}

export function computeTop1(birth: Birth): Top1Result {
  const chart = computeChart(birth);
  return {
    marriageAge: marriageAgeFromSeed(chart.seed),
    sun: chart.sun,
    seed: chart.seed,
  };
}

/** 26~27 아기 / 28~29 학생 / 30~34 어른 / 35~38 노인 — 카드 캐릭터 결정용. */
export function lifeStageOf(age: number): LifeStage {
  if (age <= 27) return "baby";
  if (age <= 29) return "student";
  if (age <= 34) return "adult";
  return "elder";
}

/** 별자리별 "관계에서 결정 내리는 방식" — 연애 맥락이 아니라 이 기능 전용으로 새로 쓴 짧은 문구.
 *  ⚠️ 결혼 나이(STAGE_COMMENT)는 별자리와 무관한 별도 시드에서 나오므로, 여기서는 "빠르다/느리다"
 *  같은 속도 단정을 넣지 않는다 — 넣으면 나이 결과와 정반대로 나왔을 때 문장이 앞뒤로 모순된다. */
const SIGN_TIMING: Record<string, string> = {
  양자리: "마음먹으면 앞뒤 안 재고 밀어붙이는",
  황소자리: "한번 정하면 끝까지 밀고 가는",
  쌍둥이자리: "이 사람 저 사람 재보며 마음이 자주 바뀌는",
  게자리: "가족이 될 사람을 신중하게 품는",
  사자자리: "제대로 된 무대에서 화려하게 올리고 싶어하는",
  처녀자리: "조건을 하나하나 꼼꼼히 따지는",
  천칭자리: "이쪽저쪽 저울질하며 균형을 재는",
  전갈자리: "한번 꽂히면 주저 없이 밀어붙이는",
  사수자리: "자유로운 삶에 미련이 많이 남는",
  염소자리: "현실적인 준비가 끝나야 움직이는",
  물병자리: "남들 속도는 신경 안 쓰고 자기 때에 맞춰가는",
  물고기자리: "분위기와 감정에 잘 이끌리는",
};

/** 생애 단계별 코멘트 — 카드 캐릭터(아기/학생/어른/노인) 농담과 결을 맞췄다.
 *  실제 계산된 나이(숫자) 자체를 그대로 설명하는 문장이라 위 SIGN_TIMING과 절대 충돌하지 않는다. */
const STAGE_COMMENT: Record<LifeStage, string> = {
  baby: "완전 아기 신부·신랑 소리 들을 만큼 압도적으로 빠른 편이에요.",
  student: "학생 티도 안 벗었는데 벌써 골인해버리는 스타일이에요.",
  adult: "딱 무난한 어른의 타이밍, 우리 중 평균에 가까워요.",
  elder: "웬만해선 서두르지 않는, 우리 중 최고참 연륜의 결혼이에요.",
};

export function describeTop1(result: Top1Result): string {
  const timing = SIGN_TIMING[result.sun] ?? SIGN_TIMING["양자리"];
  const comment = STAGE_COMMENT[lifeStageOf(result.marriageAge)];
  // "라서"(원인) 대신 "인데"(단순 연결)를 써서, 별자리 성향과 실제 나이 결과가
  // 서로 다른 방향이어도("느긋한 성격인데 의외로 일찍 결혼") 자연스럽게 읽히게 한다.
  return `${result.sun}답게 ${timing} 편인데, ${comment}`;
}
