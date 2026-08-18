/** 근거(명반 인용) 뱅크 — 리포트가 실제 만세력/자미두수/점성술 값을 짚으며 "왜 그런지"를 설명하기 위한 자료.
 *  일간(천간), 자미두수 주성(명궁·부처궁), 별자리(태양·달·상승궁)를 연애 맥락으로 해석한다.
 *  ⚠️ 해석 문안은 통용되는 명리/자미두수/점성술 상식을 압축한 것. 실서비스 감수 권장. */

import {
  STEMS, STEMS_HANJA, BRANCHES, BRANCHES_HANJA, ELEMENTS, type Chart,
} from "./saju";

const ELEMENT_HANJA = ["木", "火", "土", "金", "水"];
const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

/** 일간(천간)별 연애 기제 — "이 일간이 왜 이렇게 사랑하는가" */
const STEM_LOVE = [
  "곧게 자라는 큰 나무의 기운이라, 연애에서도 먼저 이끌고 지켜주려는 쪽입니다. 굽히는 걸 자존심 상해해서 사과가 늦는 편입니다",
  "덩굴과 화초의 기운이라, 부드럽게 맞춰주는 듯하면서도 기댈 대상을 은근히 저울질합니다. 유연해 보여도 속으로는 계산이 섭니다",
  "한낮의 태양 같은 기운이라, 감정을 숨기지 못하고 관심을 주고받는 걸 좋아합니다. 빨리 뜨거워진 만큼 식는 것도 빠릅니다",
  "촛불과 등불의 기운이라, 겉은 잔잔해도 속정이 깊습니다. 티 안 나게 챙기고 질투도 안으로 삼킵니다",
  "큰 산과 대지의 기운이라, 든든하지만 표현이 서툽니다. 한번 마음에 들인 사람은 웬만해선 밀어내지 않습니다",
  "밭과 정원의 기운이라, 상대를 잘 품고 챙기지만 그만큼 혼자 속앓이를 합니다. 이미 끝난 관계도 오래 붙들어 미련이 깁니다",
  "무쇠와 원석의 기운이라, 좋고 싫음이 분명하고 화끈합니다. 아니라고 판단하면 정이 있어도 칼같이 정리합니다",
  "보석과 칼날의 기운이라, 예민하고 자존심이 강합니다. 작은 말에도 상처받고, 기준에 안 맞으면 마음을 닫습니다",
  "강과 바다의 기운이라, 스케일이 크고 사교적입니다. 사람을 두루 편하게 대하지만 한곳에 매이는 걸 답답해합니다",
  "이슬과 시냇물의 기운이라, 속을 잘 안 보여주고 상대를 오래 관찰합니다. 감정은 깊은데 표현을 아껴 오해를 삽니다",
];

/** 자미두수 주성 — 명궁(내 기질) / 부처궁(배우자·연애) 해석 */
const STAR_LOVE: Record<string, { ming: string; bucho: string }> = {
  자미: { ming: "자존심과 품격을 주는 별이라 리드하려 하고, 기대기보다 존중받고 싶어합니다", bucho: "듬직하고 주관 뚜렷한 상대를 만나는 자리지만, 서로 자존심이 세면 기 싸움이 됩니다" },
  천기: { ming: "머리 회전이 빠르고 생각이 많은 별이라, 재고 따지다 타이밍을 놓치기 쉽습니다", bucho: "대화가 잘 통하는 상대를 뜻하지만, 상대의 변덕에 휘둘리기 쉽습니다" },
  태양: { ming: "밝고 베푸는 별이라 표현이 시원한 대신 안으로 지칠 때가 있습니다", bucho: "활동적이고 사회성 좋은 상대를 뜻합니다. 밖으로 도는 사람이라 외로움을 느낄 수 있습니다" },
  무곡: { ming: "현실감과 결단의 별이라 감정 표현이 무뚝뚝해 오해를 삽니다", bucho: "표현은 서툴러도 책임감 강한 상대를 뜻합니다. 애정 표현이 적어 서운할 수 있습니다" },
  천동: { ming: "정 많고 느긋한 별이라 편안하지만 우유부단합니다", bucho: "다정하고 편안한 상대를 뜻하지만, 결정이 느려 답답할 수 있습니다" },
  염정: { ming: "강렬한 매력과 까다로움을 함께 주는 별이라, 감정 기복이 겉으로 그대로 드러납니다", bucho: "끌림이 강한 상대를 뜻하지만, 밀당과 감정 굴곡이 잦습니다" },
  천부: { ming: "포용과 안정의 별이라 무리하지 않고 관계를 지키는 편입니다", bucho: "안정적이고 살림을 잘 꾸리는 상대를 뜻합니다" },
  태음: { ming: "섬세한 감수성과 내향성의 별이라, 표현보다 분위기로 마음을 전합니다", bucho: "배려 깊고 섬세한 상대를 뜻하지만, 예민함이 갈등의 씨앗이 됩니다" },
  탐랑: { ming: "매력과 다재다능의 별이라 인기가 많은 만큼 유혹도 많습니다", bucho: "매력적이고 사교적인 상대를 뜻합니다. 주변 이성이 많아 신경 쓰입니다" },
  거문: { ming: "말솜씨와 의심을 함께 주는 별이라, 대화가 무기이자 갈등의 원인입니다", bucho: "말이 잘 통하지만 말다툼도 잦은 상대를 뜻합니다" },
  천상: { ming: "신의와 조율의 별이라 관계에서 균형을 맞추려 애씁니다", bucho: "신뢰가 두텁고 배려하는 상대를 뜻합니다" },
  천량: { ming: "어른스러움과 노파심의 별이라 챙기려다 잔소리가 됩니다", bucho: "연상처럼 챙겨주는 상대를 뜻하지만, 간섭으로 느껴질 수 있습니다" },
  칠살: { ming: "승부욕과 독립성의 별이라 강하게 끌고 가려다 부딪힙니다", bucho: "강하고 독립적인 상대를 뜻합니다. 서로 안 굽히면 충돌합니다" },
  파군: { ming: "변화와 파격의 별이라 관계에 굴곡이 잦습니다", bucho: "만남과 헤어짐이 반복되기 쉬운 인연을 뜻합니다" },
};

/** 12지지(자축인묘진사오미신유술해)별 기운 — 일지(사주)와 명궁 위치(자미두수) 양쪽에서 재사용.
 *  같은 오행이라도 지지가 다르면 결이 갈리도록, 오행보다 한 단계 더 세밀한 12분류로 쓴다. */
const BRANCH_TRAIT = [
  "밤부터 조용히 움직이는 시작의 기운", // 자
  "느리지만 우직하게 다지는 기운",       // 축
  "먼저 뛰어드는 개척의 기운",           // 인
  "유연하게 뻗어나가는 성장의 기운",     // 묘
  "역동적으로 판을 바꾸는 기운",         // 진
  "치밀하게 재고 살피는 통찰의 기운",    // 사
  "뜨겁게 타오르는 정점의 기운",         // 오
  "온화하게 거두어들이는 기운",          // 미
  "기민하게 움직이는 실행의 기운",       // 신
  "예리하게 다듬어 완성하는 기운",       // 유
  "든든하게 지키는 수호의 기운",         // 술
  "깊이 품어 안는 포용의 기운",          // 해
];
export function branchTrait(branch: string) {
  const i = BRANCHES.indexOf(branch);
  return i >= 0 ? BRANCH_TRAIT[i] : BRANCH_TRAIT[0];
}

/** 별자리 연애 성향 (태양궁·달궁·상승궁 공통 해석) */
const SIGN_LOVE: Record<string, string> = {
  양자리: "먼저 직진하고 즉흥적으로 표현하는",
  황소자리: "느리게 다가가도 한번 정하면 진득하고 소유욕이 있는",
  쌍둥이자리: "말과 리듬으로 연결되고 가벼워 보여도 금방 싫증 내는",
  게자리: "정이 많고 가정적이지만 기분에 크게 좌우되는",
  사자자리: "화려하게 표현하고 자존심이 세도 한번 빠지면 헌신하는",
  처녀자리: "세심하게 챙기고 따지지만 정작 표현은 서툰",
  천칭자리: "균형과 매너를 중시하지만 결정을 자꾸 미루는",
  전갈자리: "깊이 빠지고 올인하지만 집착으로 흐르기 쉬운",
  사수자리: "자유롭고 솔직하지만 구속을 못 견디는",
  염소자리: "진지하고 현실적이며 천천히 마음을 여는",
  물병자리: "친구처럼 편하게 대하지만 거리를 두는",
  물고기자리: "감성적이고 헌신적이지만 상대를 이상화하는",
};

export type Grounding = ReturnType<typeof grounding>;

export function grounding(c: Chart) {
  const ds = c.pillars.day.stem;
  const el = Math.floor(ds / 2);
  const ilgan = `${STEMS[ds]}${ELEMENTS[el]}(${STEMS_HANJA[ds]}${ELEMENT_HANJA[el]})`;
  const ilji = `${BRANCHES[c.pillars.day.branch]}(${BRANCHES_HANJA[c.pillars.day.branch]})`;
  const wolji = `${BRANCHES[c.pillars.month.branch]}(${BRANCHES_HANJA[c.pillars.month.branch]})`;
  const buchoGong = c.gongs.find((g) => g.name === "부처")!;
  const gong = (name: string) => c.gongs.find((g) => g.name === name)!;
  const myungGong = c.gongs.find((g) => g.isMing);
  const myungBranch = myungGong?.branch ?? BRANCHES[0];

  return {
    ilgan,
     iljiEl: ELEMENTS[BRANCH_ELEMENT[c.pillars.day.branch]],
    ilganMech: STEM_LOVE[ds],
    ilji,
    iljiTrait: branchTrait(BRANCHES[c.pillars.day.branch]), // 일지 12분류 (사주)
    ilju: c.pillars.day.ko, // 일주 60갑자 원문 (예: "갑인") — 일간10×일지12 중 실제 존재하는 60가지 조합
    iljuHanja: c.pillars.day.hanja,
    wolji,
    myungStar: c.mingStar,
    myungWhy: (STAR_LOVE[c.mingStar] ?? STAR_LOVE["자미"]).ming,
    myungBranch, // 명궁이 자리한 12지지 (자미두수 — 오행보다 세밀한 12분류)
    myungBranchTrait: branchTrait(myungBranch),
    // 부처궁도 명궁처럼 공궁(주성 없음)일 수 있다 — buchoWhy가 이미 천동으로 폴백하므로
    // buchoStar도 같은 별로 폴백시켜, 화면에 빈 문자열이 찍히거나 별명과 성향 문구가
    // 어긋나는(예: 별 이름은 비어 있는데 성향은 천동 것) 일이 없게 한다.
    buchoStar: buchoGong.star || "천동",
    buchoWhy: (STAR_LOVE[buchoGong.star] ?? STAR_LOVE["천동"]).bucho,
    gongStar: (name: string) => gong(name).star,
    sun: c.sun,
    sunLove: SIGN_LOVE[c.sun] ?? "",
    moon: c.moon,
    moonLove: SIGN_LOVE[c.moon] ?? "",
    asc: c.asc,
    ascLove: c.asc ? SIGN_LOVE[c.asc] ?? "" : null,
    domEl: ELEMENTS[c.dominant],
    lackEl: ELEMENTS[c.lacking],
    // 오행 분포 원본 — "여덟 글자 중 토가 네 자"처럼 실제 수치를 인용해야 근거가 구체해진다.
    // 지금까지는 domEl/lackEl(강·약 라벨)만 써서 어느 명반이든 같은 문장이 나왔다.
    domCount: c.elementCount[c.dominant],
    lackCount: c.elementCount[c.lacking],
    totalChars: c.elementCount.reduce((a, b) => a + b, 0),
    // 아예 없는 오행 — 있으면 "무(無)○" 구조라 해석의 결정적 단서가 된다.
    missingEls: ELEMENTS.filter((_, i) => c.elementCount[i] === 0),
    // 오행을 많은 순으로 정렬한 라벨 (예: "토 4 · 금 2 · 수 1")
    elSpread: ELEMENTS.map((e, i) => ({ el: e, n: c.elementCount[i] }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n),
    yearPillar: c.pillars.year.ko,
    monthPillar: c.pillars.month.ko,
    timeKnown: c.timeKnown,
    // 태양-달 원소 일치 여부 (겉/속 온도차)
    sunMoonAligned: sunEl(c.sun) === sunEl(c.moon),
  };
}

function sunEl(sign: string) {
  const fire = ["양자리", "사자자리", "사수자리"];
  const earth = ["황소자리", "처녀자리", "염소자리"];
  const air = ["쌍둥이자리", "천칭자리", "물병자리"];
  if (fire.includes(sign)) return 0;
  if (earth.includes(sign)) return 1;
  if (air.includes(sign)) return 2;
  return 3;
}


/** 관록(일)·재백(돈)·질액(몸) 궁에 든 주성의 "그 영역에서의" 해석.
 *  명궁용 일반 성향(STAR_LOVE.ming)은 연애 기준으로 쓰여 있어서, 커리어 리포트에
 *  "관록궁에 파군성이 자리해 관계에 굴곡이 잦습니다"처럼 질문과 어긋나는 문장이 나왔다. */
const STAR_DOMAIN: Record<string, { career: string; wealth: string; health: string }> = {
  자미: { career: "위에서 판을 보는 자리라 실무보다 총괄·기획 쪽에서 값이 매겨집니다", wealth: "규모 있는 돈을 다루는 자리라, 잔돈 관리보다 큰 흐름을 잡을 때 유리합니다", health: "체력의 기복은 적은 편이나 책임이 몰릴 때 한 번에 무너지기 쉽습니다" },
  천기: { career: "머리로 푸는 일에 강해 기획·분석·설계 쪽에서 두각이 납니다", wealth: "정보와 판단으로 버는 자리라, 발로 뛰는 수입보다 머리로 만든 수입이 큽니다", health: "생각이 많아 신경성·수면 쪽으로 먼저 신호가 옵니다" },
  태양: { career: "드러나는 자리에서 힘이 붙어 대외·영업·교육 쪽이 맞습니다", wealth: "베풀며 버는 구조라 들어오는 만큼 나가는 폭도 큽니다", health: "에너지를 밖으로 많이 써서 한번 지치면 회복이 더딥니다" },
  무곡: { career: "숫자와 실행으로 증명되는 자리에 강해 재무·기술·현장 쪽이 맞습니다", wealth: "모으는 힘이 뚜렷해 자산이 차곡차곡 쌓이는 편입니다", health: "무리를 참고 밀어붙이다 관절·근골격 쪽에 부담이 쌓입니다" },
  천동: { career: "경쟁보다 안정된 환경에서 오래 버틸 때 성과가 누적됩니다", wealth: "큰 욕심을 안 내는 대신 크게 잃지도 않는 구조입니다", health: "무리는 덜 하지만 운동량이 부족해 체중·순환 쪽이 약해집니다" },
  염정: { career: "몰입할 대상이 있으면 성과가 크고, 없으면 기복이 큽니다", wealth: "관심이 쏠린 곳에 크게 넣는 편이라 편차가 큽니다", health: "감정 기복이 곧 컨디션 기복으로 이어집니다" },
  천부: { career: "지키고 관리하는 자리에 강해 운영·총무·자산관리 쪽이 맞습니다", wealth: "지키는 힘이 좋아 한번 모인 돈이 잘 안 새어 나갑니다", health: "큰 병보다 소화·대사 쪽 관리가 관건입니다" },
  태음: { career: "꼼꼼히 챙기는 일에 강해 회계·연구·창작 쪽에서 값이 납니다", wealth: "드러내지 않고 모으는 구조라 남들이 아는 것보다 실속이 있습니다", health: "예민해서 수면과 스트레스 관리가 컨디션을 좌우합니다" },
  탐랑: { career: "사람과 감각이 자산이라 영업·기획·문화 쪽에서 기회가 많습니다", wealth: "들어오는 통로가 여럿인 대신 나가는 구멍도 여럿입니다", health: "즐기는 쪽으로 무리해서 생활 습관이 건강을 가릅니다" },
  거문: { career: "말과 논리로 먹고사는 자리에 강해 상담·법무·교육 쪽이 맞습니다", wealth: "말과 계약으로 버는 만큼, 문서에서 새는 돈도 조심해야 합니다", health: "구강·호흡기와 신경 쪽에 먼저 신호가 옵니다" },
  천상: { career: "조율하는 자리에 강해 관리·인사·중재 쪽에서 오래 갑니다", wealth: "급하게 불리기보다 신용으로 안정적으로 쌓는 구조입니다", health: "무리보다 불규칙이 더 해로운 체질입니다" },
  천량: { career: "책임지고 챙기는 자리에 강해 관리·공공·의료 쪽이 맞습니다", wealth: "위기에 강해 크게 잃을 자리에서 오히려 지켜냅니다", health: "만성적인 쪽으로 오래 끄는 편이라 정기 점검이 중요합니다" },
  칠살: { career: "승부처에서 힘이 붙어 개척·영업·창업 쪽에서 결과가 납니다", wealth: "한 번에 크게 벌고 크게 쓰는 진폭이 큰 구조입니다", health: "과로를 자각 못 하고 밀어붙이다 한 번에 탈이 납니다" },
  파군: { career: "판을 새로 짜는 국면에 강해 전환기·신규 조직에서 값이 매겨집니다", wealth: "들어오고 나가는 진폭이 커서 목돈 관리가 관건입니다", health: "생활 리듬이 자주 바뀌어 회복 주기가 흐트러지기 쉽습니다" },
};

/** 궁(영역)에 맞춘 주성 해석 — 커리어/재물/건강 리포트가 명궁용 연애 해석을 끌어 쓰지 않게 한다. */
export function starInDomain(star: string, domain: "career" | "wealth" | "health") {
  return (STAR_DOMAIN[star] ?? STAR_DOMAIN["천동"])[domain];
}

export function starMeaning(star: string, palace: "ming" | "bucho") {
  return (STAR_LOVE[star] ?? STAR_LOVE["천동"])[palace];
}
