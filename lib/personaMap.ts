/** 별:결 관계 지도 — 이 기기(브라우저) 안에서만 유효한 로컬 저장소.
 *  서버에 아무것도 보내지 않으므로, 여러 사람이 각자 다른 기기에서 만든 지도는 서로 합쳐지지 않는다.
 *  링크를 열면 "그 링크를 연 사람"의 지도에 공유자가 친구로 추가되는 구조.
 *  친구는 생년월일(정확한 계산) 또는 유형 직접 선택(생년월일을 모를 때) 둘 중 하나로 등록한다. */

import { computePersona, personaFromChoice, type Element, type PersonaResult, type PersonaShare } from "./persona";

export type PersonaMapEntry = {
  id: string;
  name: string;
  isMe: boolean;
  addedAt: number;
} & (
  | { mode: "birth"; y: number; m: number; d: number; h?: number }
  | { mode: "type"; element: Element; sign: string }
);

const KEY = "byeolgyeol_persona_map_v1";

export function birthEntryId(p: PersonaShare): string {
  return `birth-${p.y}-${p.m}-${p.d}-${p.h ?? "x"}`;
}

/** 이름까지 포함 — 생년월일 없이 유형만으로는 두 사람을 구분할 방법이 없어서 */
export function typeEntryId(element: Element, sign: string, name: string): string {
  return `type-${element}-${sign}-${name}`;
}

export function resultOfEntry(e: PersonaMapEntry): PersonaResult {
  return e.mode === "type"
    ? personaFromChoice(e.element, e.sign)
    : computePersona({ y: e.y, m: e.m, d: e.d, hourBranch: e.h });
}

export function loadMap(): PersonaMapEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveMap(entries: PersonaMapEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // 저장 공간이 없거나 접근 불가 — 조용히 무시 (핵심 기능 아님)
  }
}

/** 같은 id가 이미 있으면 갱신, 없으면 추가 */
export function upsertEntry(entry: PersonaMapEntry): PersonaMapEntry[] {
  const entries = loadMap();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  saveMap(entries);
  return entries;
}

export function getMe(): PersonaMapEntry | undefined {
  return loadMap().find((e) => e.isMe);
}
