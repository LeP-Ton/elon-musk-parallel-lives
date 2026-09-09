import { profile } from '../character/elon/profile-v1';
import type { Choice, LifeState } from '../game/types';
export const clamp = (value: number, max = 100) =>
  Math.min(max, Math.max(0, value));
export function calculateChoiceFit(choice: Choice, state: LifeState) {
  const entries = Object.entries(choice.affinity ?? {}) as [
    keyof typeof profile.values,
    number,
  ][];
  let score = entries.length
    ? entries.reduce(
        (sum, [key, weight]) => sum + profile.values[key] * weight,
        0,
      ) / entries.reduce((sum, [, weight]) => sum + Math.abs(weight), 0)
    : 65;
  // 年龄、职业经历与精力让“求稳”成为可理解的选择，绝不作为硬性禁选理由。
  if (
    choice.autonomyCost &&
    (state.tags.includes('startup_failed') || state.energy < 45)
  )
    score += 22;
  if (
    state.age > 24 &&
    state.currentCareer === '软件工程师' &&
    choice.autonomyCost
  )
    score += 8;
  if ((choice.affinity?.engineeringDrive ?? 0) > 0)
    score += (profile.personality.Ti - 50) * 0.08;
  score = clamp(score);
  return {
    score,
    label: score >= 70 ? 'Natural' : score >= 30 ? 'Plausible' : 'Unnatural',
  };
}
export function updatePersonalityConflict(
  state: LifeState,
  choice: Choice,
): LifeState {
  const cost = choice.autonomyCost ?? -6;
  return {
    ...state,
    autonomyConflict: clamp(
      state.autonomyConflict + (cost * profile.values.autonomy) / 100,
    ),
    ambitionPressure: clamp(
      state.ambitionPressure + (cost * profile.values.ambition) / 150,
    ),
    unresolvedProblemPressure: clamp(
      state.unresolvedProblemPressure + cost / 3,
    ),
    stress: clamp(state.stress + Math.max(0, cost) / 4),
  };
}
