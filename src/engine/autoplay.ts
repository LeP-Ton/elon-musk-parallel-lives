import type { Choice, Game, Registry } from '../game/types';
import { matches } from './conditions';
import { calculateChoiceFit } from './personality';
import { outcomeWeights } from './probability';
import { random, weightedIndex } from './rng';
import { advance, choose, currentText, availableChoices } from './runtime';

export const AUTOPLAY_POLICY = 'autoplay-v1';
export type PlaybackSpeed = 1 | 2 | 4;

/** 独立选择策略：不预演结果、不挑选结局，也不消耗结果判定的随机流。 */
export function automaticChoices(game: Game, registry: Registry) {
  if (game.phase !== 'choice') return [];
  const event = registry.events.find((e) => e.id === game.currentEventId);
  if (!event) throw new Error('自动播放找不到当前场景。');
  const state = game.state;
  return (
    availableChoices(game, registry)
      .filter((choice) => matches(choice.requirements, state))
      // 条件可能让某个选项的所有结果都失效，此时不将它加入自动候选。
      .filter((choice) =>
        outcomeWeights(choice, state).some((weight) => weight > 0),
      )
      .map((choice) => {
        const fit = calculateChoiceFit(choice, state).score;
        const affinity = Object.entries(choice.affinity ?? {});
        const magnitude = affinity.reduce(
          (sum, [, value]) => sum + Math.abs(value),
          0,
        );
        // 每轮的关注重点由种子稳定生成；不修改角色本身的人格参数。
        const emphasis = magnitude
          ? affinity.reduce(
              (sum, [axis, value]) =>
                sum +
                value *
                  (random(
                    state.seed,
                    'autoplay',
                    `${AUTOPLAY_POLICY}:focus:${axis}`,
                  ) *
                    2 -
                    1),
              0,
            ) / magnitude
          : 0;
        const caution = (state.stress + 100 - state.energy) / 200;
        const need = choice.affinity ?? {};
        const context =
          caution *
            ((need.stabilityNeed ?? 0) - (need.riskTolerance ?? 0)) *
            0.6 +
          (state.autonomyConflict / 100) * (need.autonomy ?? 0) * 0.8;
        const weight = Math.exp(
          Math.max(
            -3,
            Math.min(3, (fit - 50) / 80 + emphasis * 0.75 + context),
          ),
        );
        return { choice, weight, fit };
      })
  );
}

export function selectAutomaticChoice(
  game: Game,
  registry: Registry,
): Choice | null {
  if (game.phase !== 'choice') return null;
  const candidates = automaticChoices(game, registry);
  if (!candidates.length)
    throw new Error('当前没有可执行的自动选择，已暂停。请检查内容或读取存档。');
  const roll = random(
    game.state.seed,
    'autoplay',
    `${AUTOPLAY_POLICY}:choice:${game.currentEventId}`,
    game.state.history.length,
  );
  return candidates[
    weightedIndex(
      candidates.map((row) => row.weight),
      roll,
    )
  ].choice;
}

/** 与手动操作共用唯一的 choose / advance 入口，保留全部条件和概率规则。 */
export function stepAutomatically(game: Game, registry: Registry): Game {
  if (game.phase === 'ending') return game;
  if (game.phase !== 'choice') return advance(game, registry);
  return choose(game, registry, selectAutomaticChoice(game, registry)!.id);
}

export function readingDelay(
  game: Game,
  registry: Registry,
  speed: PlaybackSpeed,
): number {
  if (game.phase === 'ending') return 0;
  const event = registry.events.find((e) => e.id === game.currentEventId);
  if (!event) throw new Error('无法计算缺失场景的阅读时间。');
  const text =
    currentText(game, registry) +
    availableChoices(game, registry)
      .map((c) => c.text + c.hint)
      .join('');
  // 按中文阅读量留时间；即使 4 倍速也至少展示 2 秒，不连续闪过结果页。
  return Math.max(
    2000,
    Math.min(60000, Math.max(8000, 2500 + Array.from(text).length * 160)) /
      speed,
  );
}

/** 仅在用户开启新人生时取系统熵；SSR 和每次渲染都不能重新抽种子。 */
export function freshWorldSeed(): string {
  const words = crypto.getRandomValues(new Uint32Array(4));
  return `MUSK-${Array.from(words, (word) => word.toString(36))
    .join('-')
    .toUpperCase()}`;
}
