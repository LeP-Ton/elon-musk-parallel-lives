import type { Condition, ContentPack, Registry } from '../game/types';
import { createRegistry } from '../content/registry';
export function validateContent(packs: ContentPack[]): string[] {
  const errors: string[] = [];
  let r: Registry;
  try {
    r = createRegistry(packs);
  } catch (e) {
    return [String(e)];
  }
  const duplicate = (ids: string[], label: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${label} ID 重复：${id}`);
      seen.add(id);
    }
  };
  duplicate(
    r.events.map((e) => e.id),
    'Event/Random Event',
  );
  duplicate(
    r.endings.map((e) => e.id),
    'Ending',
  );
  duplicate(
    r.assets.map((a) => a.id),
    'Asset',
  );
  duplicate(
    r.sources.map((s) => s.id),
    'Source',
  );
  const asset = (id: string | undefined, type: string, owner: string) => {
    if (id && !r.assets.some((a) => a.id === id && a.type === type))
      errors.push(`${owner} 引用了不存在的 ${type}：${id}`);
  };
  const checkConditions = (conditions: Condition[], owner: string) => {
    const intervals = new Map<string, [number, number]>();
    const required = new Set<string>();
    const absent = new Set<string>();
    for (const c of conditions) {
      if ('field' in c) {
        const bounds = intervals.get(c.field) ?? [
          c.field === 'year' ? 1971 : 0,
          ['wealth', 'income', 'year', 'age'].includes(c.field)
            ? Infinity
            : 100,
        ];
        if (
          (c.gte !== undefined && !Number.isFinite(c.gte)) ||
          (c.lte !== undefined && !Number.isFinite(c.lte))
        )
          errors.push(`${owner} 条件数值非法`);
        bounds[0] = Math.max(bounds[0], c.gte ?? -Infinity);
        bounds[1] = Math.min(bounds[1], c.lte ?? Infinity);
        intervals.set(c.field, bounds);
        if (bounds[0] > bounds[1])
          errors.push(`${owner} 永远不可满足：${c.field}`);
      } else if ('tag' in c) {
        if (!r.tags.has(c.tag)) errors.push(`${owner} 未声明标签 ${c.tag}`);
        (c.absent ? absent : required).add(c.tag);
      } else if ('history' in c) {
        if (!r.events.some((e) => e.id === c.history))
          errors.push(`${owner} 不存在的历史事件 ${c.history}`);
      } else if ('any' in c) {
        if (!c.any.length) errors.push(`${owner} 空的任一条件组`);
        // 分支中的矛盾仅在所有候选分支都不可满足时使整个 any 失效。
        const branchErrors = c.any.map((group) => {
          const start = errors.length;
          checkConditions(
            [...conditions.filter((x) => x !== c && !('any' in x)), ...group],
            owner,
          );
          return errors.splice(start);
        });
        for (const entry of branchErrors
          .flat()
          .filter((e) => !e.includes('永远不可满足')))
          errors.push(entry);
        if (
          branchErrors.every((list) =>
            list.some((e) => e.includes('永远不可满足')),
          )
        )
          errors.push(`${owner} 任一条件组永远不可满足`);
      }
    }
    for (const tag of required)
      if (absent.has(tag))
        errors.push(`${owner} 永远不可满足：标签 ${tag} 冲突`);
    const year = intervals.get('year');
    const age = intervals.get('age');
    if (year && age && (year[0] - 1971 > age[1] || year[1] - 1971 < age[0]))
      errors.push(`${owner} 年份与年龄永远不可同时满足`);
  };
  for (const e of r.events) {
    checkConditions(e.conditions, e.id);
    if (!e.scene.openingNarrative.trim()) errors.push(`${e.id} 缺少场景正文`);
    if (e.truthType !== 'ALTERNATE' && !e.sourceRefs?.length)
      errors.push(`${e.id} Canon 缺少 sourceRefs`);
    if (e.truthType !== 'ALTERNATE' && e.historicalConfidence === 'alternate')
      errors.push(`${e.id} Alternate 错误标记 Canon`);
    for (const id of e.sourceRefs ?? [])
      if (!r.sources.some((s) => s.id === id))
        errors.push(`${e.id} 不存在的史料 ${id}`);
    if (e.storyRole === 'random' && e.once === false && !e.cooldown)
      errors.push(`${e.id} 可重复随机事件缺少 cooldown`);
    if (
      'baseWeight' in e &&
      (!Number.isFinite(e.baseWeight) || Number(e.baseWeight) <= 0)
    )
      errors.push(`${e.id} 随机池权重非法`);
    asset(e.scene.backgroundKey, 'background', e.id);
    for (const id of e.scene.characterKeys ?? []) asset(id, 'character', e.id);
    for (const id of e.scene.propKeys ?? []) asset(id, 'prop', e.id);
    asset(e.scene.audioKey, 'audio', e.id);
    for (const v of e.scene.variants ?? [])
      checkConditions(v.when, `${e.id} 动态正文`);
    if (!e.choices.length) errors.push(`${e.id} 没有可选行动`);
    duplicate(
      e.choices.map((c) => c.id),
      `${e.id}/Choice`,
    );
    for (const c of e.choices) {
      checkConditions(
        [...e.conditions, ...(c.requirements ?? [])],
        `${e.id}/${c.id}`,
      );
      duplicate(
        c.outcomes.map((o) => o.id),
        `${e.id}/${c.id}/Outcome`,
      );
      if (!c.outcomes.length || c.outcomes.every((o) => o.weight <= 0))
        errors.push(`${e.id}/${c.id} 没有正概率结果`);
      for (const o of c.outcomes) {
        if (!Number.isFinite(o.weight) || o.weight < 0)
          errors.push(`${e.id}/${c.id} 非法 Probability Weight`);
        if (!o.narrative.trim())
          errors.push(`${e.id}/${c.id} Outcome 缺少 Narrative`);
        checkConditions(
          [...e.conditions, ...(c.requirements ?? []), ...(o.conditions ?? [])],
          `${e.id}/${c.id}/${o.id}`,
        );
        if (o.nextEventId && !r.events.some((e) => e.id === o.nextEventId))
          errors.push(`${e.id} nextEventId 不存在：${o.nextEventId}`);
        for (const tag of [...(o.addTags ?? []), ...(o.removeTags ?? [])])
          if (!r.tags.has(tag)) errors.push(`${e.id} 未声明标签 ${tag}`);
        for (const effect of o.effects ?? [])
          if (!Number.isFinite(effect.delta))
            errors.push(`${e.id} 非法属性效果`);
      }
    }
  }
  for (const e of r.endings) {
    checkConditions(e.conditions, `Ending ${e.id}`);
    if (!e.narrative.trim()) errors.push(`Ending ${e.id} 缺少总结`);
  }
  // 标签与历史的保守数据流分析，能识别没有入口的相互依赖；数值可达性由上方区间检查及路线测试补足。
  const reachableTags = new Set(packs.flatMap((p) => p.entryTags ?? []));
  const reachableEvents = new Set<string>();
  const possible = (conditions: Condition[]): boolean =>
    conditions.every((c) =>
      'tag' in c
        ? !!c.absent || reachableTags.has(c.tag)
        : 'history' in c
          ? !!c.absent || reachableEvents.has(c.history)
          : 'any' in c
            ? c.any.some(possible)
            : true,
    );
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of r.events) {
      if (!possible(e.conditions)) continue;
      if (!reachableEvents.has(e.id)) {
        reachableEvents.add(e.id);
        changed = true;
      }
      for (const c of e.choices)
        if (possible(c.requirements ?? []))
          for (const o of c.outcomes)
            if (o.weight > 0 && possible(o.conditions ?? []))
              for (const tag of o.addTags ?? [])
                if (!reachableTags.has(tag)) {
                  reachableTags.add(tag);
                  changed = true;
                }
    }
  }
  for (const e of r.events)
    if (!reachableEvents.has(e.id))
      errors.push(`${e.id} 明显不可达：标签或历史没有可达生产者`);
  for (const e of r.endings)
    if (!possible(e.conditions))
      errors.push(`Ending ${e.id} 明显不可达：标签或历史没有可达生产者`);
  return [...new Set(errors)];
}
