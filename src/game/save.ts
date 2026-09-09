import type { Game, Registry } from './types';
import { initialState } from '../engine/runtime';
export type SaveSlot = { savedAt: string; game: Game };
export const SAVE_PREFIX = 'parallel-lives:v1:';
export function serialize(game: Game): string {
  return JSON.stringify({ savedAt: new Date().toISOString(), game });
}
/** 所有存档都视作不可信输入；先验证，再交给界面，避免部分加载损坏状态。 */
export function deserialize(raw: string, registry: Registry): SaveSlot {
  if (raw.length > 2_000_000) throw new Error('存档过大，无法读取');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('存档不是有效 JSON');
  }
  const fail = (): never => {
    throw new Error('存档结构损坏或版本不兼容');
  };
  if (!parsed || typeof parsed !== 'object') return fail();
  const slot = parsed as SaveSlot;
  const game = slot.game;
  if (
    !game ||
    game.schemaVersion !== 1 ||
    !game.state ||
    !['choice', 'result', 'ending'].includes(game.phase) ||
    typeof slot.savedAt !== 'string' ||
    !Number.isFinite(Date.parse(slot.savedAt))
  )
    return fail();
  const s = game.state;
  for (const key of [
    'technical',
    'business',
    'network',
    'reputation',
    'influence',
    'energy',
    'stress',
    'autonomyConflict',
    'ambitionPressure',
    'unresolvedProblemPressure',
  ] as const)
    if (s[key] > 100) return fail();
  if (s.simulationProfileVersion !== 'elon-profile-v1')
    throw new Error('不支持此人物模型版本');
  for (const [key, value] of Object.entries(initialState('check'))) {
    const actual = s[key as keyof typeof s];
    if (
      typeof value === 'number' &&
      (typeof actual !== 'number' || !Number.isFinite(actual) || actual < 0)
    )
      return fail();
    if (
      typeof value === 'string' &&
      (typeof actual !== 'string' || actual.length > 500)
    )
      return fail();
  }
  if (
    s.age !== s.year - 1971 ||
    s.year < 1983 ||
    s.year > 2200 ||
    !s.seed.trim() ||
    s.timelineDeviation > 100
  )
    return fail();
  if (
    !Array.isArray(s.tags) ||
    s.tags.some((t) => typeof t !== 'string' || !registry.tags.has(t)) ||
    !Array.isArray(s.history) ||
    s.history.length > 10000
  )
    return fail();
  if (
    !game.contentVersions ||
    typeof game.contentVersions !== 'object' ||
    !game.attempts ||
    typeof game.attempts !== 'object'
  )
    return fail();
  for (const [id, version] of Object.entries(game.contentVersions))
    if (registry.versions[id] !== version)
      throw new Error(`内容包缺失或版本不兼容：${id}`);
  if (!Object.keys(game.contentVersions).length) return fail();
  for (const [id, count] of Object.entries(game.attempts))
    if (
      !registry.events.some((e) => e.id === id) ||
      !Number.isInteger(count) ||
      count < 0
    )
      return fail();
  const visits: Record<string, number> = {};
  let previousYear = 1983;
  for (const h of s.history) {
    if (!h || typeof h !== 'object') return fail();
    const event = registry.events.find((e) => e.id === h.eventId);
    const choice = event?.choices.find((c) => c.id === h.choiceId);
    if (
      !choice?.outcomes.some((o) => o.id === h.outcomeId) ||
      !Number.isFinite(h.year) ||
      h.year < previousYear ||
      h.year > s.year ||
      !Number.isFinite(h.roll) ||
      h.roll < 0 ||
      h.roll >= 1 ||
      !Number.isInteger(h.attempt) ||
      h.attempt < 0 ||
      !Number.isFinite(h.deviation) ||
      h.deviation < 0 ||
      h.deviation > 100 ||
      h.stream !== 'outcome' ||
      !['CANON_FACT', 'CANON_DRAMATIZED', 'ALTERNATE'].includes(h.truthType) ||
      !Array.isArray(h.weights) ||
      h.weights.length !== choice.outcomes.length ||
      h.weights.some((w) => !Number.isFinite(w) || w < 0)
    )
      return fail();
    if (h.attempt !== (visits[h.eventId] ?? 0)) return fail();
    visits[h.eventId] = (visits[h.eventId] ?? 0) + 1;
    previousYear = h.year;
  }
  for (const id of new Set([
    ...Object.keys(visits),
    ...Object.keys(game.attempts),
  ]))
    if ((game.attempts[id] ?? 0) !== (visits[id] ?? 0)) return fail();
  if (game.phase === 'ending') {
    if (!registry.endings.some((e) => e.id === game.endingId)) return fail();
  } else if (!registry.events.some((e) => e.id === game.currentEventId))
    return fail();
  if (
    game.phase === 'result' &&
    s.history.at(-1)?.eventId !== game.currentEventId
  )
    return fail();
  if (
    game.pendingEventId &&
    !registry.events.some((e) => e.id === game.pendingEventId)
  )
    return fail();
  return slot;
}
export function saveSlot(storage: Storage, slot: number, game: Game): void {
  try {
    storage.setItem(SAVE_PREFIX + slot, serialize(game));
  } catch {
    throw new Error('浏览器无法写入存档，请检查存储空间或导出备份');
  }
}
export function loadSlot(
  storage: Storage,
  slot: number,
  registry: Registry,
): SaveSlot | null {
  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_PREFIX + slot);
  } catch {
    throw new Error('浏览器不允许读取本地存档');
  }
  return raw ? deserialize(raw, registry) : null;
}
