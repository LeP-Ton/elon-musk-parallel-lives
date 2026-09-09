import type { Condition, LifeState } from '../game/types';
export function conditionReason(c: Condition, state: LifeState): string | null {
  if ('relationship' in c) {
    const value = state.relationships[c.relationship] ?? 50;
    if (value < (c.gte ?? 0) || value > (c.lte ?? 100))
      return `关系尚未满足：${c.relationship}`;
  } else if ('promise' in c) {
    if (state.promises[c.promise] !== c.status)
      return `承诺尚未${c.status}：${c.promise}`;
  } else if ('field' in c) {
    const value = state[c.field];
    if (c.gte !== undefined && value < c.gte)
      return `${c.field} ${value} < ${c.gte}`;
    if (c.lte !== undefined && value > c.lte)
      return `${c.field} ${value} > ${c.lte}`;
  } else if ('tag' in c) {
    if (state.tags.includes(c.tag) === !!c.absent)
      return `${c.absent ? '需要移除' : '缺少标签'} ${c.tag}`;
  } else if ('history' in c) {
    if (state.history.some((h) => h.eventId === c.history) === !!c.absent)
      return `${c.absent ? '已经经历' : '尚未经历'} ${c.history}`;
  } else if ('career' in c) {
    if (state.currentCareer !== c.career) return `职业需要 ${c.career}`;
  } else if (!c.any.some((group) => matches(group, state)))
    return `任一条件组均不满足：${c.any.map((group) => reasons(group, state).join('、')).join(' / ')}`;
  return null;
}
export function reasons(
  conditions: Condition[] = [],
  state: LifeState,
): string[] {
  return conditions
    .map((c) => conditionReason(c, state))
    .filter((x): x is string => x !== null);
}
export function matches(
  conditions: Condition[] = [],
  state: LifeState,
): boolean {
  return reasons(conditions, state).length === 0;
}
