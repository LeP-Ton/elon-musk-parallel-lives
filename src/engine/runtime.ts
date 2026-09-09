import type {
  Choice,
  Game,
  LifeEvent,
  LifeState,
  Outcome,
  Registry,
  Truth,
} from '../game/types';
import { profile } from '../character/elon/profile-v1';
import { matches } from './conditions';
import { clamp, updatePersonalityConflict } from './personality';
import { resolveEventOutcome } from './probability';
import { scheduleNextEvent } from './scheduler';
export function initialState(seed: string): LifeState {
  return {
    year: 1983,
    age: 12,
    wealth: 30,
    income: 0,
    technical: 28,
    business: 8,
    network: 5,
    reputation: 3,
    influence: 0,
    energy: 88,
    stress: 14,
    autonomyConflict: 0,
    ambitionPressure: 10,
    unresolvedProblemPressure: 5,
    currentCountry: '南非',
    currentCity: '比勒陀利亚',
    currentCareer: '学生',
    currentCompany: '',
    currentIdentity: '年轻的探索者',
    tags: [],
    history: [],
    timelineDeviation: 0,
    seed: seed.trim() || 'MUSK-88421',
    simulationProfileVersion: profile.id,
  };
}
export function newGame(registry: Registry, seed = 'MUSK-88421'): Game {
  return advance(
    {
      schemaVersion: 1,
      state: initialState(seed),
      currentEventId: null,
      phase: 'choice',
      endingId: null,
      attempts: {},
      contentVersions: { ...registry.versions },
    },
    registry,
  );
}
export function applyEffects(
  state: LifeState,
  outcome: Outcome,
  choice: Choice,
): LifeState {
  let next = { ...state, tags: [...state.tags], history: [...state.history] };
  for (const effect of outcome.effects ?? [])
    next[effect.stat] = clamp(
      next[effect.stat] + effect.delta,
      effect.stat === 'wealth' || effect.stat === 'income'
        ? Number.MAX_SAFE_INTEGER
        : 100,
    );
  next.tags = [
    ...new Set([
      ...next.tags.filter((t) => !outcome.removeTags?.includes(t)),
      ...(outcome.addTags ?? []),
    ]),
  ];
  next.year = Math.max(next.year, outcome.year ?? next.year);
  next.age = next.year - 1971;
  next.currentCareer = outcome.career ?? next.currentCareer;
  next.currentCompany = outcome.company ?? next.currentCompany;
  next.currentCity = outcome.city ?? next.currentCity;
  next.currentCountry = outcome.country ?? next.currentCountry;
  next.timelineDeviation = clamp(
    next.timelineDeviation + (outcome.deviation ?? 0),
  );
  next = updatePersonalityConflict(next, choice);
  return next;
}
export function sceneTruth(event: LifeEvent, state: LifeState): Truth {
  return event.truthType === 'ALTERNATE' || state.timelineDeviation > 0
    ? 'ALTERNATE'
    : event.truthType;
}
export function choose(game: Game, registry: Registry, choiceId: string): Game {
  if (game.phase !== 'choice')
    throw new Error('请先阅读结果，再进入下一个场景');
  const event = registry.events.find((e) => e.id === game.currentEventId);
  const choice = event?.choices.find((c) => c.id === choiceId);
  if (!event || !choice || !matches(choice.requirements, game.state))
    throw new Error('当前选择不可用');
  const attempt = game.attempts[event.id] ?? 0;
  const { outcome, roll, weights } = resolveEventOutcome(
    choice,
    game.state,
    event.id,
    attempt,
  );
  const state = applyEffects(game.state, outcome, choice);
  state.history.push({
    eventId: event.id,
    choiceId,
    outcomeId: outcome.id,
    year: game.state.year,
    truthType:
      outcome.deviation && outcome.deviation > 0
        ? 'ALTERNATE'
        : sceneTruth(event, game.state),
    roll,
    weights,
    stream: 'outcome',
    attempt,
    deviation: state.timelineDeviation,
  });
  return {
    ...game,
    state,
    phase: 'result',
    pendingEventId: outcome.nextEventId,
    attempts: { ...game.attempts, [event.id]: attempt + 1 },
  };
}
export function advance(game: Game, registry: Registry): Game {
  const state = { ...game.state };
  const ending = registry.endings.find((e) => matches(e.conditions, state));
  if (ending)
    return {
      ...game,
      state,
      phase: 'ending',
      endingId: ending.id,
      currentEventId: null,
      pendingEventId: undefined,
    };
  let event = game.pendingEventId
    ? registry.events.find(
        (e) => e.id === game.pendingEventId && matches(e.conditions, state),
      )
    : undefined;
  // 只跳到已注册内容的下一时间边界，不写死任何公司或事件 ID。
  const boundaries = registry.events
    .flatMap((e) =>
      e.conditions.flatMap((c) =>
        'field' in c && c.field === 'year' && c.gte !== undefined
          ? [c.gte]
          : [],
      ),
    )
    .filter((y) => y > state.year)
    .sort((a, b) => a - b);
  event ??= scheduleNextEvent(registry, state);
  for (const year of [...new Set(boundaries)]) {
    if (event) break;
    state.year = year;
    state.age = year - 1971;
    event = scheduleNextEvent(registry, state);
  }
  if (!event)
    throw new Error('当前人生没有后续场景：请查看开发检查器或读取存档');
  return {
    ...game,
    state,
    currentEventId: event.id,
    phase: 'choice',
    pendingEventId: undefined,
    contentVersions: { ...registry.versions },
  };
}
export function narrativeText(event: LifeEvent, state: LifeState): string {
  const additions =
    event.scene.variants
      ?.filter((v) => matches(v.when, state))
      .map((v) => v.text) ?? [];
  return [event.scene.openingNarrative, ...additions]
    .join('\n\n')
    .replaceAll('{{currentCompany}}', state.currentCompany || '公司')
    .replaceAll('{{currentCareer}}', state.currentCareer);
}
