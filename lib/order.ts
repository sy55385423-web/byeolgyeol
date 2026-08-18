/** 주문/리포트 페이로드 ↔ URL-safe 문자열.
 *  리포트는 결정적으로 재생성되므로, 입력을 통째로 인코딩한 값이 곧 리포트 ID가 된다.
 *  → 링크만 있으면 어느 기기에서든 같은 리포트가 열린다 (공유·저장의 근거).
 *  ⚠️ 결제 검증이 없는 모의 단계 — PG 연동 시 서버 발급 주문 ID + 서명으로 교체할 것. */

export type OrderPerson = { y: number; m: number; d: number; h?: number }; // h: 시지 index

export type Order = {
  c: string;              // categoryId
  n?: string;             // 이름/애칭
  me: OrderPerson;
  pt?: OrderPerson;       // 궁합·재회 상대방
  pn?: string;            // 상대방 이름/애칭
  q?: string;             // 추가 질문 (deep, 1개 무료)
  t: "basic" | "unlimited";
};

export function encodeOrder(o: Order): string {
  const json = JSON.stringify(o);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeOrder(id: string): Order | null {
  try {
    const b64 = id.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    const o = JSON.parse(json);
    if (!o || typeof o.c !== "string" || !o.me) return null;
    return o as Order;
  } catch {
    return null;
  }
}
