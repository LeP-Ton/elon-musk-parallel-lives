import type {
  LifeEvent,
  LifeState,
  Registry,
  RandomEventDefinition,
} from '../game/types';
import { reasons } from './conditions';
import { random } from './rng';
export function inspectCandidates(registry: Registry, state: LifeState) {
  const recent = state.history.slice(-2);
  return registry.events
    .map((event) => {
      const locked = reasons(event.conditions, state);
      const visits = state.history.filter((h) => h.eventId === event.id);
      if (event.once !== false && visits.length)
        locked.push('一次性事件已发生');
      if (event.expiresAt !== undefined && state.year > event.expiresAt)
        locked.push('机会窗口已关闭');
      const latest = visits.at(-1);
      if (
        latest &&
        event.cooldown &&
        state.history.length - state.history.indexOf(latest) <= event.cooldown
      )
        locked.push('事件冷却中');
      if (event.storyRole === 'random' || event.storyRole === 'minor') {
        const lastEvent = registry.events.find(
          (e) => e.id === recent.at(-1)?.eventId,
        );
        if (
          lastEvent?.storyRole === 'random' ||
          lastEvent?.storyRole === 'minor'
        )
          locked.push('节奏：两次主事件之间至多一次插曲');
        if (
          event.cooldownGroup &&
          recent.some(
            (h) =>
              registry.events.find((e) => e.id === h.eventId)?.cooldownGroup ===
              event.cooldownGroup,
          )
        )
          locked.push('同类插曲冷却中');
      }
      const imminent =
        event.expiresAt === state.year ? (event.urgency ?? 0) * 2 : 0;
      const role = { anchor: 40, major: 20, minor: 0, random: 0 }[
        event.storyRole
      ];
      const pressure =
        event.category === 'crisis'
          ? state.stress * 0.2
          : event.category === 'reflection'
            ? state.autonomyConflict * 0.3
            : 0;
      const randomWeight =
        event.storyRole === 'random'
          ? (event as RandomEventDefinition).baseWeight *
            random(state.seed, 'randomEvent', event.id, state.history.length)
          : 0;
      const score =
        event.priority +
        role +
        imminent +
        pressure +
        randomWeight +
        random(state.seed, 'narrative', event.id, state.history.length) * 0.01;
      return {
        event,
        reasons: locked,
        score,
        pool: 'pool' in event ? String(event.pool) : '主线',
      };
    })
    .sort((a, b) => b.score - a.score || a.event.id.localeCompare(b.event.id));
}
export function scheduleNextEvent(
  registry: Registry,
  state: LifeState,
): LifeEvent | undefined {
  return inspectCandidates(registry, state).find((c) => c.reasons.length === 0)
    ?.event;
}
