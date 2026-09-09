import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  corePacks,
  createRegistry,
  legacyPacks,
} from '../src/content/registry';
import { testAlternatePack } from '../src/content/packs/test-alternate-pack';
import { validateContent } from '../src/engine/validator';
import { inspectPortrait } from './portrait-check';
const packs = corePacks;
const errors = [
  ...validateContent(packs),
  ...validateContent([...legacyPacks, testAlternatePack]),
];
const registry = createRegistry(packs);
const portraitHashes = new Map<string, string>();
const portraitSizes = new Map<string, string>();
for (const asset of registry.assets) {
  const path = resolve('public', asset.path.replace(/^\//, ''));
  if (!existsSync(path)) errors.push(`资产文件不存在：${asset.path}`);
  else if (asset.type === 'character') {
    try {
      const result = inspectPortrait(readFileSync(path));
      const duplicate = portraitHashes.get(result.pixelHash);
      if (duplicate) errors.push(`立绘像素重复：${asset.path} 与 ${duplicate}`);
      portraitHashes.set(result.pixelHash, asset.path);
      const character = asset.path.replace(
        /-(neutral|thoughtful|happy|worried|angry|sad)\.png$/,
        '',
      );
      const size = `${result.width}x${result.height}`;
      if (portraitSizes.has(character) && portraitSizes.get(character) !== size)
        errors.push(`同人物表情画布尺寸不一致：${asset.path}`);
      portraitSizes.set(character, size);
    } catch (error) {
      errors.push(`${asset.path}：${(error as Error).message}`);
    }
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `内容校验通过：${registry.events.filter((e) => e.storyRole !== 'minor').length} 个主线及分支场景、${registry.events.filter((e) => e.storyRole === 'minor').length} 个条件插曲、${registry.endings.length} 个结局；旧版引擎夹具与独立测试包同样通过。`,
  );
