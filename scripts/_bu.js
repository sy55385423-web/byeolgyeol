/** 재회 카테고리는 헤어진 시기를 입력받는다. 그 경로를 안 태우면 검사기가
 *  이별 기준 문장(전체 문단의 절반)을 한 번도 못 본다. 사람마다 다른 시점을
 *  주되, 이미 회복 구간이 지난 사람과 갓 헤어진 사람이 섞이게 한다.
 *  일부는 undefined로 남겨 미입력(구버전 공유 링크) 경로도 함께 검사한다. */
export const buOf = (catId, i) => {
  if (catId !== "love-reunion" || i % 5 === 4) return undefined;
  const back = [2, 9, 20, 46][i % 4];            // 개월 전
  const now = new Date();
  const t = now.getFullYear() * 12 + now.getMonth() - back;
  return { y: Math.floor(t / 12), m: (t % 12) + 1 };
};
