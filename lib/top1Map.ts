/** 우리중 TOP1 친구 목록 — 이 기기(브라우저) 안에서만 유효한 로컬 저장소.
 *  "궁합 순위(나의 별:결)" 기능의 관계 지도와는 별개의 목록이다 — 사용자가 이 기능
 *  전용으로 분리해달라고 요청했다. 서버에 아무것도 보내지 않는다. */

import { computeTop1, type Top1Result } from "./top1";

export type Top1Entry = {
  id: string;
  name: string;
  isMe: boolean;
  addedAt: number;
  y: number;
  m: number;
  d: number;
  h?: number;
};

const KEY = "byeolgyeol_top1_map_v1";

export function top1EntryId(p: { y: number; m: number; d: number; h?: number }): string {
  return `top1-${p.y}-${p.m}-${p.d}-${p.h ?? "x"}`;
}

export function resultOfEntry(e: Top1Entry): Top1Result {
  return computeTop1({ y: e.y, m: e.m, d: e.d, hourBranch: e.h });
}

export function loadTop1Map(): Top1Entry[] {
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

function saveTop1Map(entries: Top1Entry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // 저장 공간이 없거나 접근 불가 — 조용히 무시 (핵심 기능 아님)
  }
}

/** 같은 id가 이미 있으면 갱신, 없으면 추가 */
export function upsertTop1Entry(entry: Top1Entry): Top1Entry[] {
  const entries = loadTop1Map();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  saveTop1Map(entries);
  return entries;
}

export function getTop1Me(): Top1Entry | undefined {
  return loadTop1Map().find((e) => e.isMe);
}
