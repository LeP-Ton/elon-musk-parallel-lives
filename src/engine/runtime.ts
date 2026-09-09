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
    relationships: {},
    promises: {},
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
      schemaVersion: 2,
      visitedScenes: [],
      transcript: [],
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
  let next = {
    ...state,
    tags: [...state.tags],
    history: [...state.history],
    relationships: { ...state.relationships },
    promises: { ...state.promises, ...outcome.promises },
  };
  for (const [id, delta] of Object.entries(outcome.relationships ?? {}))
    next.relationships[id] = clamp((next.relationships[id] ?? 50) + delta);
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
  const choice = availableChoices(game, registry).find(
    (c) => c.id === choiceId,
  );
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
    ...(game.nodeId ? { nodeId: game.nodeId } : {}),
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
  if (game.phase === 'ending') return game;
  const current = registry.events.find((e) => e.id === game.currentEventId);
  if (current?.scene.script) {
    const node = currentNode(game, registry);
    if (!node) throw Error('场景节点不存在');
    if (game.phase === 'choice') throw Error('请先作出选择');
    if (game.phase === 'result') {
      const last = game.state.history.at(-1)!;
      const outcome = current.choices
        .find((c) => c.id === last.choiceId)
        ?.outcomes.find((o) => o.id === last.outcomeId);
      if (!outcome?.nextNodeId) throw Error('选择缺少后续节点');
      return enterNode(
        {
          ...game,
          transcript: [
            ...game.transcript,
            {
              eventId: current.id,
              nodeId: node.id,
              choiceId: last.choiceId,
              outcomeId: last.outcomeId,
            },
          ],
        },
        registry,
        outcome.nextNodeId,
      );
    }
    if (
      node.type === 'dialogue' ||
      node.type === 'thought' ||
      node.type === 'narration'
    )
      return enterNode(
        {
          ...game,
          transcript: [
            ...game.transcript,
            { eventId: current.id, nodeId: node.id },
          ],
        },
        registry,
        node.next,
      );
    if (node.type !== 'end') throw Error('无法推进此节点');
    const state = {
      ...game.state,
      year: Math.max(game.state.year, node.year ?? game.state.year),
    };
    state.age = state.year - 1971;
    const base = { ...game, state, nodeId: undefined };
    if (node.endingId) {
      const finished = {
        ...state,
        tags: [...new Set([...state.tags, `ending-${node.endingId}`])],
      };
      const ending = registry.endings.find((e) => e.id === node.endingId);
      if (!ending || !matches(ending.conditions, finished))
        throw Error('结局条件未满足');
      return {
        ...base,
        state: finished,
        phase: 'ending',
        endingId: node.endingId,
        currentEventId: null,
      };
    }
    const nextId =
      node.routes?.find((route) => matches(route.when, state))?.next ??
      node.nextEventId;
    if (!nextId) throw Error('场景缺少出口');
    const next = registry.events.find((e) => e.id === nextId);
    if (!next) throw Error(`下一场景不存在：${nextId}`);
    const nextState = { ...state, year: Math.max(state.year, next.scene.year) };
    nextState.age = nextState.year - 1971;
    if (!matches(next.conditions, nextState))
      throw Error(`下一场景不可进入：${nextId}`);
    base.state = nextState;
    return enterScene(base, registry, next);
  }
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
  for (const year of new Set(boundaries)) {
    if (event) break;
    state.year = year;
    state.age = year - 1971;
    event = scheduleNextEvent(registry, state);
  }
  if (!event)
    throw new Error('当前人生没有后续场景：请查看开发检查器或读取存档');
  return enterScene(
    {
      ...game,
      state,
      currentEventId: event.id,
      phase: 'choice',
      pendingEventId: undefined,
      contentVersions: { ...registry.versions },
    },
    registry,
    event,
  );
}

/** 场景入口是唯一的节点初始化位置；回看和渲染均不得调用它。 */
function enterScene(game: Game, registry: Registry, event: LifeEvent): Game {
  const next: Game = {
    ...game,
    state: {
      ...game.state,
      currentCountry: event.scene.country ?? game.state.currentCountry,
      currentCity: event.scene.city ?? game.state.currentCity,
    },
    currentEventId: event.id,
    phase: 'choice',
    pendingEventId: undefined,
    visitedScenes: [...game.visitedScenes, event.id],
    contentVersions: { ...registry.versions },
  };
  return event.scene.script
    ? enterNode(next, registry, event.scene.script.entry)
    : next;
}
function enterNode(game: Game, registry: Registry, id: string): Game {
  const event = registry.events.find((e) => e.id === game.currentEventId)!;
  const seen = new Set<string>();
  let node = event.scene.script?.nodes.find((n) => n.id === id);
  while (node?.type === 'branch') {
    if (seen.has(node.id)) throw Error('条件节点存在循环');
    seen.add(node.id);
    const target =
      node.branches.find((b) => matches(b.when, game.state))?.next ??
      node.fallback;
    node = event.scene.script?.nodes.find((n) => n.id === target);
  }
  if (!node) throw Error(`找不到场内节点：${id}`);
  return {
    ...game,
    nodeId: node.id,
    phase: node.type === 'choice' ? 'choice' : 'reading',
  };
}
export function currentNode(game: Game, registry: Registry) {
  return registry.events
    .find((e) => e.id === game.currentEventId)
    ?.scene.script?.nodes.find((n) => n.id === game.nodeId);
}
export function availableChoices(game: Game, registry: Registry): Choice[] {
  if (game.phase !== 'choice') return [];
  const event = registry.events.find((e) => e.id === game.currentEventId);
  const node = currentNode(game, registry);
  return (event?.choices ?? []).filter(
    (c) =>
      (!event?.scene.script ||
        (node?.type === 'choice' && node.choices.includes(c.id))) &&
      matches(c.requirements, game.state),
  );
}
export function currentText(game: Game, registry: Registry): string {
  if (game.phase === 'ending') return endingText(game, registry);
  const event = registry.events.find((e) => e.id === game.currentEventId);
  if (!event) return '';
  if (game.phase === 'result') {
    const h = game.state.history.at(-1);
    return (
      event.choices
        .find((c) => c.id === h?.choiceId)
        ?.outcomes.find((o) => o.id === h?.outcomeId)?.narrative ?? ''
    );
  }
  const node = currentNode(game, registry);
  return node
    ? 'text' in node
      ? node.text
      : node.type === 'end'
        ? '这一幕暂告一段落。带着刚才的决定，走向下一页。'
        : ''
    : narrativeText(event, game.state);
}
export function endingText(game: Game, registry: Registry): string {
  const text =
    registry.endings.find((e) => e.id === game.endingId)?.narrative ?? '';
  const relationships = registry.characters
    .filter((c) => game.state.relationships[c.id] !== undefined)
    .map((c) => {
      const trust = game.state.relationships[c.id];
      return trust >= 60
        ? `${c.name}仍愿意接你的电话。支持不是赞成你的一切，而是你给了对方拒绝和参与的余地。`
        : trust < 45
          ? `${c.name}已经学会先确认日期，再相信你的下一句承诺。你获得的自由中，也有别人退出后留下的空位。`
          : `${c.name}与你保持联系。那些尚未说完的话，并不会因为事业走到这一页就自动消失。`;
    });
  const kept = Object.values(game.state.promises).filter(
    (p) => p === 'kept',
  ).length;
  const broken = Object.values(game.state.promises).filter(
    (p) => p === 'broken',
  ).length;
  return [
    text,
    ...relationships,
    `你兑现了${kept}项承诺，留下${broken}次失约。人生不是一次总分结算；有人记住了结果，也有人只记住你是否按时出现。`,
  ].join('\n\n');
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
