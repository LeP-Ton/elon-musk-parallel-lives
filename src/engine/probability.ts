import type { Choice, LifeState, Outcome } from '../game/types';
import { matches } from './conditions';
import { calculateChoiceFit } from './personality';
import { random, weightedIndex } from './rng';
export function outcomeWeights(choice: Choice, state: LifeState): number[] {
  const fit = calculateChoiceFit(choice, state).score;
  return choice.outcomes.map((outcome) => {
    if (!matches(outcome.conditions, state)) return 0;
    const modifier = (outcome.modifiers ?? []).reduce(
      (sum, m) =>
        sum +
        (m.tag && !state.tags.includes(m.tag) ? 0 : state[m.field] * m.factor),
      0,
    );
    // 人格适配只小幅改变有正向能力修正的结果，不让人格替代现实条件。
    return Math.max(
      0,
      outcome.weight + modifier + (modifier > 0 ? (fit - 50) * 0.08 : 0),
    );
  });
}
export function resolveEventOutcome(
  choice: Choice,
  state: LifeState,
  eventId: string,
  attempt: number,
): { outcome: Outcome; roll: number; weights: number[] } {
  const weights = outcomeWeights(choice, state);
  const roll = random(state.seed, 'outcome', eventId, attempt);
  return {
    outcome: choice.outcomes[weightedIndex(weights, roll)],
    roll,
    weights,
  };
}
