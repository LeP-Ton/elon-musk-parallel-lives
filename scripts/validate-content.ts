import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { corePacks, createRegistry } from '../src/content/registry';
import { testAlternatePack } from '../src/content/packs/test-alternate-pack';
import { validateContent } from '../src/engine/validator';
const packs = [...corePacks, testAlternatePack];
const errors = validateContent(packs);
const registry = createRegistry(packs);
for (const asset of registry.assets)
  if (!existsSync(resolve('public', asset.path.replace(/^\//, ''))))
    errors.push(`资产文件不存在：${asset.path}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `内容校验通过：${corePacks.flatMap((p) => p.events ?? []).length} 个核心事件、${corePacks.flatMap((p) => p.randomEvents ?? []).length} 个随机事件、${corePacks.flatMap((p) => p.endings ?? []).length} 个结局；独立测试包同样通过。`,
  );
