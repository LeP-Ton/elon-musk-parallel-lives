import type { ContentPack, Registry } from '../game/types';
import { earlyLife } from './packs/early-life';
import { siliconValley } from './packs/silicon-valley';
import { randomLife } from './packs/random-life';
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
export const corePacks = [earlyLife, siliconValley, randomLife];
export const registry = createRegistry(corePacks);
