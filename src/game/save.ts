import type { Game, Registry } from './types';
import { initialState, newGame, choose, advance } from '../engine/runtime';
export type SaveSlot = { savedAt: string; game: Game };
export const SAVE_PREFIX = 'parallel-lives:v2:';
export const LEGACY_SAVE_PREFIX = 'parallel-lives:v1:';
/** 旧档按原始字节导出，不解析、不迁移、更不会覆盖旧键。 */
export function legacyBackups(
  storage: Storage,
): { slot: number; raw: string }[] {
  return [0, 1, 2, 3].flatMap((slot) => {
    const raw = storage.getItem(LEGACY_SAVE_PREFIX + slot);
    return raw === null ? [] : [{ slot, raw }];
  });
}
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
  if ((game?.schemaVersion as number) === 1)
    throw Error('这是旧版人生存档，请保留备份；视觉小说版需要开启新人生。');
  if (
    !game ||
    game.schemaVersion !== 2 ||
    !game.state ||
    !['reading', 'choice', 'result', 'ending'].includes(game.phase) ||
    typeof slot.savedAt !== 'string' ||
    !Number.isFinite(Date.parse(slot.savedAt))
  )
    return fail();
  const s = game.state;
  if (
    !s.relationships ||
    typeof s.relationships !== 'object' ||
    Array.isArray(s.relationships) ||
    !s.promises ||
    typeof s.promises !== 'object' ||
    Array.isArray(s.promises)
  )
    return fail();
  for (const [id, trust] of Object.entries(s.relationships))
    if (
      !registry.characters.some((c) => c.id === id) ||
      !Number.isFinite(trust) ||
      trust < 0 ||
      trust > 100
    )
      return fail();
  const knownPromises = new Set(
    registry.events.flatMap((e) =>
      e.choices.flatMap((c) =>
        c.outcomes.flatMap((o) => Object.keys(o.promises ?? {})),
      ),
    ),
  );
  for (const [id, status] of Object.entries(s.promises))
    if (
      !knownPromises.has(id) ||
      !['pending', 'kept', 'broken'].includes(status)
    )
      return fail();
  if (
    !Array.isArray(game.visitedScenes) ||
    game.visitedScenes.length > 1000 ||
    game.visitedScenes.some(
      (id) => !registry.events.some((e) => e.id === id),
    ) ||
    !Array.isArray(game.transcript) ||
    game.transcript.length > 10000
  )
    return fail();
  for (const line of game.transcript) {
    if (!line || typeof line !== 'object') return fail();
    const e = registry.events.find((e) => e.id === line.eventId);
    const n = e?.scene.script?.nodes.find((n) => n.id === line.nodeId);
    if (!n || !['narration', 'thought', 'dialogue', 'choice'].includes(n.type))
      return fail();
    if (
      n.type === 'choice' &&
      (!line.choiceId ||
        !n.choices.includes(line.choiceId) ||
        !e?.choices
          .find((c) => c.id === line.choiceId)
          ?.outcomes.some((o) => o.id === line.outcomeId))
    )
      return fail();
  }
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
  const current = registry.events.find((e) => e.id === game.currentEventId);
  if (current?.scene.script) {
    const node = current.scene.script.nodes.find((n) => n.id === game.nodeId);
    if (
      !node ||
      node.type === 'branch' ||
      game.visitedScenes.at(-1) !== current.id
    )
      return fail();
    if (
      (game.phase === 'choice' || game.phase === 'result') !==
      (node.type === 'choice')
    )
      return fail();
    const last = s.history.at(-1);
    if (
      game.phase === 'result' &&
      (last?.nodeId !== node.id ||
        node.type !== 'choice' ||
        !node.choices.includes(last.choiceId))
    )
      return fail();
    // 已结算的选择不能伪装为待选节点，防止篡改游标重复结算。
    if (
      game.phase === 'choice' &&
      s.history.some((h) => h.eventId === current.id && h.nodeId === node.id)
    )
      return fail();
  }
  if (
    game.pendingEventId &&
    !registry.events.some((e) => e.id === game.pendingEventId)
  )
    return fail();
  if (game.contentVersions['early-visual-novel']) {
    // 用种子与已记录选择重放，验证游标、关系、承诺及日志属于同一次真实可达人生。
    // 仅在读档时运行；日常逐句保存不做重放，避免影响阅读响应。
    let replay = newGame(registry, s.seed);
    let found = false;
    for (let step = 0; step < 5000; step++) {
      if (
        replay.currentEventId === game.currentEventId &&
        replay.nodeId === game.nodeId &&
        replay.phase === game.phase &&
        replay.state.history.length === s.history.length &&
        replay.transcript.length === game.transcript.length
      ) {
        found = true;
        break;
      }
      if (replay.phase === 'ending') break;
      if (replay.phase === 'choice') {
        const recorded = s.history[replay.state.history.length];
        if (
          !recorded ||
          recorded.eventId !== replay.currentEventId ||
          recorded.nodeId !== replay.nodeId
        )
          return fail();
        replay = choose(replay, registry, recorded.choiceId);
      } else replay = advance(replay, registry);
    }
    const canonical = (value: unknown): string =>
      JSON.stringify(value, (_key, child) =>
        child && typeof child === 'object' && !Array.isArray(child)
          ? Object.fromEntries(
              Object.entries(child).sort(([a], [b]) => a.localeCompare(b)),
            )
          : child,
      );
    if (
      !found ||
      canonical(replay.state) !== canonical(s) ||
      canonical(replay.attempts) !== canonical(game.attempts) ||
      canonical(replay.transcript) !== canonical(game.transcript) ||
      canonical(replay.visitedScenes) !== canonical(game.visitedScenes) ||
      replay.endingId !== game.endingId
    )
      return fail();
  }
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
