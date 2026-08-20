// 리딩 카테고리 정의 — 질문 항목은 서비스의 뼈대이므로 임의 삭제 금지.
// 문구 톤 수정은 자유. 가격은 플레이스홀더 — 실제 가격 정책으로 교체할 것.

// 미리보기 요약 통계 — value는 가려진 채 노출되는 그럴듯한 더미.
// ⚠️ 실제 분석 로직 연동 시 사용자별 실제 결과값으로 교체할 것.
export type PreviewStat = {
  label: string;    // 질문 축약 라벨
  prefix: string;   // "{이름}님의 " 뒤에 붙는 문장 앞부분
  value: string;    // 가려질 핵심 수치/키워드
  suffix?: string;  // 값 뒤 단위·문장 마무리
  gauge?: number;   // 0~100, 게이지 다이어그램 표시용
  revealed?: boolean; // true면 블러 없이 실제 공개되는 항목 (카테고리당 1개 훅)
  // 헤드라인 맨 앞에 누구 이름을 붙일지. 생략하면 기존처럼 "나"(who) — 상대방이 따로 있는
  // 궁합·재회 카테고리에서만 "partner"(상대방 이름) 또는 "shared"(이름 없이 prefix 그대로)를 쓴다.
  // 안 붙이면 "나의 바람기 지수" 같은 문항이 "{이름}님의 나의 바람기 지수는"처럼 겹쳐 나온다.
  subject?: "me" | "partner" | "shared";
};

export type Category = {
  slug: string[];          // /reading/[...slug] 라우트 세그먼트
  id: string;
  group: "연애·인간관계" | "커리어" | "재물" | "건강" | "인생";
  name: string;            // 카드/페이지 제목
  short: string;           // 카드 한 줄 소개
  minutes: number;         // 예상 소요 시간(분) — 플레이스홀더, 실측치로 교체
  needsPartner: boolean;   // 상대방 정보 입력 필요 여부
  questions: string[];     // 이 리딩이 답하는 질문 목록 (콘텐츠 유지 대상)
  teaser: string;          // 랜딩 결과 티저 문구 (일반화된 문구만)
  cta: string;             // 카테고리별 동적 CTA
  price: number;           // KRW, 플레이스홀더 — 실제 가격으로 교체
  tier: "deep" | "light";  // deep: 초상세 분량 / light: 컴팩트 요약 (리뷰 시 추가 질문 1회는 두 티어 공통)
  loadingSteps: string[];  // 분석 로딩 연출 단계 문구
  previewLine: string;     // Preview Lock에서 먼저 공개되는 핵심 한 줄 (샘플)
  previewStats?: PreviewStat[]; // 수치만 가린 다이어그램형 미리보기 (있으면 스탯 그리드로 렌더)
};

export const categories: Category[] = [
  {
    slug: ["love", "life"],
    id: "love-life",
    group: "연애·인간관계",
    name: "평생 연애 총론",
    short: "타고난 매력부터 결혼 시기까지, 내 연애의 전체 지도를 봅니다.",
    minutes: 12,
    needsPartner: false,
    questions: [
      "나의 타고난 매력은?",
      "나는 어떤 사람에게 끌릴까",
      "나의 타고난 인기는 상위 몇 %?",
      "나를 몰래 좋아했던 사람 수",
      "총 연애 횟수 예상",
      "나의 연애에서 주의할 점",
      "연애하면 안 되는 사람의 특징",
      "운명의 상대의 특징과 외모",
      "나의 연애운이 가장 좋은 시기",
      "결혼 예상 나이",
    ],
    teaser: "매력이 드러나는 방식은 사람마다 다릅니다. 당신의 방식이 어떤 결인지, 명반에서 먼저 읽어드립니다.",
    cta: "내 연애 지도 펼치기",
    price: 2990,
    tier: "deep",
    loadingSteps: [
      "생년월일로 명반을 세우는 중",
      "자미두수 명궁·부처궁을 읽는 중",
      "연애 흐름의 패턴을 분석하는 중",
      "리포트를 정리하는 중",
    ],
    previewLine: "당신의 매력은 처음보다 두 번째 만남에서 강해지는 유형입니다.",
    previewStats: [
      {
        label: "나의 타고난 매력은?",
        prefix: "타고난 매력은 ",
        value: "잔잔한 흡인력",
        suffix: "이에요",
      },
      {
        label: "나는 어떤 사람에게 끌릴까",
        prefix: "끌리는 상대는 ",
        value: "차분한 리더형",
        suffix: "이에요",
      },
      {
        label: "나의 타고난 인기는 상위 몇 %?",
        prefix: "타고난 인기는 상위 ",
        value: "14",
        suffix: "%예요",
        gauge: 86,
        revealed: true, // 결제 없이 공개되는 훅 — Flow에서 생년월일 기반 값으로 대체됨
      },
      {
        label: "나를 몰래 좋아했던 사람 수",
        prefix: "몰래 좋아했던 사람은 ",
        value: "5",
        suffix: "명이에요",
      },
      {
        label: "총 연애 횟수 예상",
        prefix: "총 연애 횟수는 ",
        value: "4",
        suffix: "회로 보여요",
      },
      {
        label: "나의 연애에서 주의할 점",
        prefix: "가장 주의할 시기는 ",
        value: "만난 지 100일",
        suffix: " 무렵이에요",
      },
      {
        label: "연애하면 안 되는 사람의 특징",
        prefix: "피해야 할 상대는 ",
        value: "다정한 회피형",
        suffix: "이에요",
      },
      {
        label: "운명의 상대의 특징과 외모",
        prefix: "운명의 상대는 ",
        value: "말수 적은 실행형",
        suffix: "을 가진 사람이에요",
      },
      {
        label: "나의 연애운이 가장 좋은 시기",
        prefix: "연애운이 가장 좋은 시기는 ",
        value: "9월",
        suffix: " 무렵이에요",
      },
      {
        label: "결혼 예상 나이",
        prefix: "결혼 시기는 ",
        value: "31",
        suffix: "세 전후예요",
      },
    ],
  },
  {
    slug: ["love", "compatibility"],
    id: "love-compatibility",
    group: "연애·인간관계",
    name: "연애 궁합 총론",
    short: "두 사람의 명반을 겹쳐, 지금 이 관계의 실제 온도를 읽습니다.",
    minutes: 15,
    needsPartner: true,
    questions: [
      "나와 상대방의 타고난 특징",
      "서로에 대한 호감도 비교",
      "지금 연인이 최선의 선택인지",
      "나의 가치관",
      "상대방의 가치관",
      "나의 바람기 지수",
      "상대방의 바람기 지수",
      "스킨십·애정표현 궁합",
      "서로에게 주는 영향",
      "얼마나 오래 만날지",
      "결혼 가능성",
      "결혼 시 주의점",
      "궁합 총점수",
    ],
    teaser: "호감의 크기가 같아도 방향은 다를 수 있습니다. 두 명반을 겹치면 그 차이가 보입니다.",
    cta: "우리의 궁합 확인하기",
    price: 2990,
    tier: "deep",
    loadingSteps: [
      "두 사람의 명반을 세우는 중",
      "합·충 관계를 대조하는 중",
      "호감의 방향을 비교하는 중",
      "궁합 리포트를 정리하는 중",
    ],
    previewLine: "두 사람은 속도가 다를 뿐, 향하는 방향은 같은 궁합입니다.",
    previewStats: [
      {
        label: "나와 상대방의 타고난 특징",
        prefix: "두 사람은 ",
        value: "물과 불",
        suffix: "의 조합이에요",
        subject: "shared",
      },
      {
        label: "서로에 대한 호감도 비교",
        prefix: "호감의 기울기는 ",
        value: "12",
        suffix: "%p 정도예요",
        subject: "shared",
      },
      {
        label: "지금 연인이 최선의 선택인지",
        prefix: "지금 인연은 ",
        value: "최선에 가까운",
        suffix: " 선택이에요",
        subject: "shared",
      },
      {
        label: "나의 가치관",
        prefix: "가장 중요하게 여기는 건 ",
        value: "솔직함",
        suffix: "이에요",
        subject: "me",
      },
      {
        label: "상대방의 가치관",
        prefix: "가장 중요하게 여기는 건 ",
        value: "안정감",
        suffix: "이에요",
        subject: "partner",
      },
      {
        label: "나의 바람기 지수",
        prefix: "바람기 지수는 ",
        value: "낮음",
        suffix: " 단계예요",
        subject: "me",
      },
      {
        label: "상대방의 바람기 지수",
        prefix: "바람기 지수는 ",
        value: "중간",
        suffix: " 단계예요",
        subject: "partner",
      },
      {
        label: "스킨십·애정표현 궁합",
        prefix: "표현 방식 궁합은 ",
        value: "보통",
        suffix: " 수준이에요",
        subject: "shared",
      },
      {
        label: "서로에게 주는 영향",
        prefix: "상대는 나에게 ",
        value: "안정",
        suffix: "을 주는 사람이에요",
        subject: "shared",
      },
      {
        label: "얼마나 오래 만날지",
        prefix: "관계 지속력은 ",
        value: "6년",
        suffix: " 이상으로 보여요",
        subject: "shared",
      },
      {
        label: "결혼 가능성",
        prefix: "결혼 가능성은 ",
        value: "74",
        suffix: "%예요",
        gauge: 74,
        subject: "shared",
      },
      {
        label: "결혼 시 주의점",
        prefix: "결혼 전 ",
        value: "2026년 가을",
        suffix: "이 고비예요",
        subject: "shared",
      },
      {
        label: "궁합 총점수",
        prefix: "궁합 총점은 ",
        value: "82",
        suffix: "점이에요",
        gauge: 82,
        revealed: true, // Flow에서 두 사람 생년월일 기반 값으로 대체됨
        subject: "shared",
      },
    ],
  },
  {
    slug: ["love", "reunion"],
    id: "love-reunion",
    group: "연애·인간관계",
    name: "재회운 총론",
    short: "끝난 이유와 남은 마음, 그리고 다시 만날 가능성까지.",
    minutes: 15,
    needsPartner: true,
    questions: [
      "둘의 연애가 어땠는지",
      "궁합과 인연",
      "상대방의 현재 마음",
      "상대방이 나를 기억하는 방식",
      "헤어진 진짜 이유",
      "나의 마음이 정리되는 시기",
      "상대방의 마음이 정리되는 시기",
      "재회 가능성",
      "연락 타이밍",
      "재회 시기",
      "새로운 사람의 존재",
      "나에게 새로운 인연이 들어오는 시기",
      "재회 후 관계",
    ],
    teaser: "이별의 표면적 이유와 명반이 말하는 이유는 다를 때가 많습니다. 그 간극부터 확인합니다.",
    cta: "재회 가능성 확인하기",
    price: 2990,
    tier: "deep",
    loadingSteps: [
      "두 사람의 인연을 되짚는 중",
      "상대의 현재 흐름을 읽는 중",
      "재회 시기의 창을 계산하는 중",
      "리포트를 정리하는 중",
    ],
    previewLine: "연락이 닿기 쉬운 창은 지금이 아니라 조금 뒤에 열립니다.",
    previewStats: [
      {
        label: "둘의 연애가 어땠는지",
        prefix: "두 사람의 연애는 ",
        value: "7:3",
        suffix: "의 관계였어요",
        subject: "shared",
      },
      {
        label: "궁합과 인연",
        prefix: "인연의 깊이는 ",
        value: "상위 18%",
        suffix: "예요",
        subject: "shared",
      },
      {
        label: "상대방의 현재 마음",
        prefix: "마음은 ",
        value: "미련 남음",
        suffix: " 상태예요",
        subject: "partner",
      },
      {
        label: "상대방이 나를 기억하는 방식",
        prefix: "상대는 나를 ",
        value: "좋았던 계절",
        suffix: "로 기억해요",
        subject: "shared",
      },
      {
        label: "헤어진 진짜 이유",
        prefix: "진짜 이유는 ",
        value: "타이밍",
        suffix: "이었어요",
        subject: "shared",
      },
      {
        label: "나의 마음이 정리되는 시기",
        prefix: "마음이 정리되는 시기는 ",
        value: "3개월 후",
        suffix: "예요",
        subject: "me",
      },
      {
        label: "상대방의 마음이 정리되는 시기",
        prefix: "마음이 정리되는 시기는 ",
        value: "5개월 후",
        suffix: "예요",
        subject: "partner",
      },
      {
        label: "재회 가능성",
        prefix: "재회 가능성은 ",
        value: "61",
        suffix: "%예요",
        gauge: 61,
        revealed: true, // Flow에서 두 사람 생년월일 기반 값으로 대체됨
        subject: "shared",
      },
      {
        label: "연락 타이밍",
        prefix: "연락의 창은 ",
        value: "3주 뒤",
        suffix: "에 열려요",
        subject: "shared",
      },
      {
        label: "재회 시기",
        prefix: "재회 시기는 ",
        value: "10월",
        suffix: " 전후로 보여요",
        subject: "shared",
      },
      {
        label: "새로운 사람의 존재",
        prefix: "새로운 사람은 ",
        value: "아직 없음",
        suffix: "으로 보여요",
        subject: "shared",
      },
      {
        label: "나에게 새로운 인연이 들어오는 시기",
        prefix: "새 인연이 들어오는 시기는 ",
        value: "내년 봄",
        suffix: "이에요",
        subject: "me",
      },
      {
        label: "재회 후 관계",
        prefix: "재회 후는 ",
        value: "이전보다 단단",
        suffix: "해져요",
        subject: "shared",
      },
    ],
  },
  {
    slug: ["life"],
    id: "life-overview",
    group: "인생",
    name: "평생 총론",
    short: "타고난 본성부터 인생 전체 시기별 흐름까지, 나의 전체 지도를 봅니다.",
    minutes: 12,
    needsPartner: false,
    questions: [
      "나의 본성과 성격",
      "타고난 내 모습과 타인이 보는 내 모습",
      "나에게 맞는 지역과 환경",
      "나의 초년운",
      "나의 청년운",
      "나의 중년운",
      "나의 말년운",
      "대운이 바뀌는 시기",
      "나의 전성기, 주의가 필요한 시기",
      "평생 피해야 할 선택이나 행동",
    ],
    teaser: "타고난 본성과 인생의 굴곡은 다른 결입니다. 언제 오르고 언제 웅크려야 하는지, 명반이 먼저 알려드립니다.",
    cta: "내 인생 지도 펼치기",
    price: 2990,
    tier: "deep",
    loadingSteps: [
      "생년월일로 명반을 세우는 중",
      "자미두수 명궁을 읽는 중",
      "인생 전체의 흐름을 분석하는 중",
      "리포트를 정리하는 중",
    ],
    previewLine: "당신의 본성은 겉으로 드러나는 인상과 다른 결을 하나 더 가지고 있습니다.",
  },
  {
    slug: ["career"],
    id: "career",
    group: "커리어",
    name: "커리어 리딩",
    short: "타고난 일의 그릇과 방향, 움직여야 할 시기를 짚습니다.",
    minutes: 12,
    needsPartner: false,
    questions: [
      "타고난 직업 적성과 일의 그릇",
      "내가 성공하기 쉬운 분야",
      "나에게 맞는 일의 방식",
      "내가 피해야 할 직업/업무 스타일",
      "커리어 전환에 유리한 시기",
      "해외·이동 운",
      "성취·승진 운의 흐름",
      "함께 일할 때 시너지가 나는 사람",
      "커리어에서 주의할 시기와 선택",
    ],
    teaser: "지금 하는 일이 안 맞는 게 아니라, 일하는 방식이 안 맞는 경우가 많습니다.",
    cta: "내 커리어 흐름 보기",
    price: 990,
    tier: "light",
    loadingSteps: [
      "명반에서 관록궁을 세우는 중",
      "일의 그릇과 방식을 읽는 중",
      "전환 시기의 흐름을 분석하는 중",
      "리포트를 정리하는 중",
    ],
    previewLine: "당신은 조직의 중심보다 경계에서 성과가 나는 유형입니다.",
  },
  {
    slug: ["wealth"],
    id: "wealth",
    group: "재물",
    name: "재물 리딩",
    short: "돈이 들어오는 통로와 새는 구멍, 모이는 시기를 봅니다.",
    minutes: 12,
    needsPartner: false,
    questions: [
      "타고난 재물의 그릇",
      "돈이 들어오는 방식과 통로",
      "재물운의 큰 흐름",
      "나에게 맞는 돈 관리 방식",
      "투자운",
      "부동산운",
      "주의해야 할 소비·투자 습관",
      "재물이 모이는 시기",
      "재물을 잃기 쉬운 시기",
    ],
    teaser: "재물운은 총량보다 통로가 중요합니다. 당신의 돈이 어느 문으로 들어오는지 먼저 확인하세요.",
    cta: "내 재물 흐름 보기",
    price: 990,
    tier: "light",
    loadingSteps: [
      "재백궁의 별을 세우는 중",
      "재물의 통로를 읽는 중",
      "모이는 시기의 흐름을 분석하는 중",
      "리포트를 정리하는 중",
    ],
    previewLine: "당신의 재물은 고정 수입보다 부수적인 통로에서 크게 움직입니다.",
  },
  {
    slug: ["health"],
    id: "health",
    group: "건강",
    name: "건강 리딩",
    short: "타고난 체질의 강약과 시기별 관리 포인트를 읽습니다.",
    minutes: 10,
    needsPartner: false,
    questions: [
      "타고난 체질과 기운의 강약",
      "특히 아껴야 할 몸의 부분",
      "컨디션이 흔들리기 쉬운 시기",
      "나에게 맞는 생활 리듬",
      "나에게 맞는 스트레스 관리법",
      "나에게 필요한 건강 관리법",
      "시기별 관리 포인트",
    ],
    teaser: "몸의 결은 태어날 때 정해진 부분이 있습니다. 무리해도 되는 곳과 아껴야 할 곳을 구분해 드립니다.",
    cta: "내 몸의 결 확인하기",
    price: 990,
    tier: "light",
    loadingSteps: [
      "질액궁의 흐름을 세우는 중",
      "체질의 강약을 읽는 중",
      "시기별 리듬을 분석하는 중",
      "리포트를 정리하는 중",
    ],
    previewLine: "당신의 컨디션은 계절보다 수면 리듬에 크게 좌우되는 체질입니다.",
  },
];

export function findCategory(slug: string[]): Category | undefined {
  return categories.find(
    (c) => c.slug.length === slug.length && c.slug.every((s, i) => s === slug[i])
  );
}

export const categoryHref = (c: Category) => `/reading/${c.slug.join("/")}`;
