import type { ContentPack, Registry } from '../game/types';
import { earlyLife } from './packs/early-life';
import { siliconValley } from './packs/silicon-valley';
import { randomLife } from './packs/random-life';
import { novelPack } from './novel';
export function createRegistry(packs: ContentPack[]): Registry {
  const ids = new Set(packs.map((p) => p.id));
  if (ids.size !== packs.length) throw new Error('内容包 ID 重复');
  const visit = (pack: ContentPack, stack: string[]) => {
    if (stack.includes(pack.id))
      throw new Error(`内容包循环依赖：${[...stack, pack.id].join(' → ')}`);
    for (const id of pack.requires ?? []) {
      const dependency = packs.find((p) => p.id === id);
      if (!dependency) throw new Error(`缺少内容包依赖 ${id}`);
      visit(dependency, [...stack, pack.id]);
    }
  };
  packs.forEach((p) => visit(p, []));
  return {
    characters: packs.flatMap((p) => p.characters ?? []),
    packs,
    events: packs.flatMap((p) => [
      ...(p.events ?? []),
      ...(p.randomEvents ?? []),
    ]),
    endings: packs.flatMap((p) => p.endings ?? []),
    assets: packs.flatMap((p) => p.assets ?? []),
    sources: packs.flatMap((p) => p.sources ?? []),
    tags: new Set(packs.flatMap((p) => p.tags ?? [])),
    versions: Object.fromEntries(packs.map((p) => [p.id, p.version])),
  };
}
export const legacyPacks = [earlyLife, siliconValley, randomLife];
/** 旧内容仅用于引擎回归测试；用户入口不再加载旧版或迁移旧档。 */
export const legacyRegistry = createRegistry(legacyPacks);
export const corePacks = [novelPack];
export const registry = createRegistry(corePacks);
