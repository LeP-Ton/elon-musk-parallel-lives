'use client';
/* eslint-disable next/no-img-element -- 本面板核对静态原始图片，不使用服务端转换。 */
import { useState } from 'react';
import type { Game, Registry } from '../game/types';
import { currentNode, availableChoices } from '../engine/runtime';
import { assetUrl } from '../game/assets';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

/** 开发面板只读，不允许改年份/游标破坏新版存档的可复现约束。 */
export function NovelInspector({
  game,
  registry,
}: {
  game: Game;
  registry: Registry;
}) {
  const [character, setCharacter] = useState(registry.characters[0].id);
  const selected = registry.characters.find((c) => c.id === character)!;
  return (
    <section className="vn-inspector">
      <p>
        只读检查，不改变当前人生。表情图片全部由实际资源加载，不使用背景或滤镜伪造表情。
      </p>
      <pre>
        {JSON.stringify(
          {
            场景: game.currentEventId,
            节点: game.nodeId,
            类型: currentNode(game, registry)?.type,
            可用选择: availableChoices(game, registry).map((c) => c.id),
            已读节点: game.transcript.length,
            已到场景: game.visitedScenes,
          },
          null,
          2,
        )}
      </pre>
      <label htmlFor="inspect-character">核对人物表情</label>
      <NativeSelect
        id="inspect-character"
        value={character}
        onChange={(e) => setCharacter(e.target.value)}
      >
        {registry.characters.map((c) => (
          <NativeSelectOption key={c.id} value={c.id}>
            {c.name} · {c.portrait}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <div className="vn-expression-gallery">
        {selected.expressions.map((expression) => (
          <figure key={expression}>
            <img
              src={assetUrl(
                `/assets/novel/characters/${selected.portrait}-${expression}.png`,
              )}
              alt={`${selected.name} ${expression}`}
              loading="lazy"
            />
            <figcaption>{expression}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
