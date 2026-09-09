import { afterEach, describe, expect, it, vi } from 'vitest';
import { corePacks, createRegistry, registry } from '../src/content/registry';
import { testAlternatePack } from '../src/content/packs/test-alternate-pack';
import {
  automaticChoices,
  freshWorldSeed,
  readingDelay,
  selectAutomaticChoice,
  stepAutomatically,
} from '../src/engine/autoplay';
import { advance, choose, initialState, newGame } from '../src/engine/runtime';
import { matches } from '../src/engine/conditions';
import { random } from '../src/engine/rng';
import { deserialize, serialize } from '../src/game/save';
import { startPlaybackClock } from '../src/game/autoplay-clock';
import type { Game } from '../src/game/types';

function finish(initial: Game) {
  let game = initial;
  for (let turn = 0; turn < 120 && game.phase !== 'ending'; turn++) {
    const before = game;
    const candidate = selectAutomaticChoice(game, registry);
    if (candidate)
      expect(matches(candidate.requirements, game.state)).toBe(true);
    game = stepAutomatically(game, registry);
    expect(game).toEqual(
      before.phase === 'choice'
        ? choose(before, registry, candidate!.id)
        : advance(before, registry),
    );
  }
  expect(game.phase, `${game.state.seed} 未到达结局`).toBe('ending');
  return game;
}

describe('自动人生策略', () => {
  it('1,000 个种子全部到达合法结局并覆盖现有五种结局', () => {
    const counts = new Map<string, number>();
    for (let i = 0; i < 1000; i++) {
      const game = finish(newGame(registry, `AUTO-${i}`));
      expect(
        matches(
          registry.endings.find((e) => e.id === game.endingId)!.conditions,
          game.state,
        ),
      ).toBe(true);
      counts.set(game.endingId!, (counts.get(game.endingId!) ?? 0) + 1);
      expect(game.state.history.length).toBeLessThanOrEqual(30);
    }
    expect([...counts.keys()].sort()).toEqual(
      registry.endings.map((e) => e.id).sort(),
    );
    // 验证确有分布而非每轮强制去重；此阈值只针对当前切片的回归样本。
    expect(Math.min(...counts.values())).toBeGreaterThan(10);
  });
  it('同一种子重播完全相同，策略不使用当前时间或共享随机游标', () => {
    expect(finish(newGame(registry, 'REPLAY-AUTO'))).toEqual(
      finish(newGame(registry, 'REPLAY-AUTO')),
    );
  });
  it('预告选择、调整阅读速度与美术抽样不影响结果流', () => {
    const game = newGame(registry, 'INDEPENDENT-AUTO');
    const before = structuredClone(game);
    const choice = selectAutomaticChoice(game, registry)!;
    const expected = choose(game, registry, choice.id);
    for (let i = 0; i < 30; i++) {
      expect(selectAutomaticChoice(game, registry)?.id).toBe(choice.id);
      random(game.state.seed, 'cosmetic', 'scene', i);
      readingDelay(game, registry, i % 2 ? 1 : 4);
    }
    expect(stepAutomatically(game, registry)).toEqual(expected);
    expect(game).toEqual(before);
  });
  it('自动选择不包含锁定选项或所有结果权重为零的选项', () => {
    const local = structuredClone(registry);
    const game = newGame(local, 'LOCKS');
    const event = local.events.find((e) => e.id === game.currentEventId)!;
    event.choices.push({
      ...structuredClone(event.choices[0]),
      id: 'locked',
      requirements: [{ field: 'technical', gte: 101 }],
    });
    event.choices.push({
      ...structuredClone(event.choices[0]),
      id: 'zero',
      outcomes: event.choices[0].outcomes.map((o) => ({
        ...o,
        weight: 0,
        modifiers: [],
      })),
    });
    for (let i = 0; i < 30; i++) {
      game.state.seed = `LOCKS-${i}`;
      const choices = automaticChoices(game, local).map((row) => row.choice.id);
      expect(choices).not.toContain('locked');
      expect(choices).not.toContain('zero');
      expect(choices).toContain(selectAutomaticChoice(game, local)!.id);
    }
  });
  it('没有合法选择时显式报错，不跳过场景或伪造结局', () => {
    const local = structuredClone(registry);
    const game = newGame(local);
    local.events.find((e) => e.id === game.currentEventId)!.choices = [];
    expect(() => stepAutomatically(game, local)).toThrow('没有可执行');
    expect(game.phase).toBe('choice');
  });
  it('压力、精力和自主冲突动态改变选择权重', () => {
    const local = structuredClone(registry);
    const game = newGame(local, 'CONTEXT');
    const event = local.events.find((e) => e.id === game.currentEventId)!;
    event.choices = [
      { ...event.choices[0], id: 'rest', affinity: { stabilityNeed: 1 } },
      { ...event.choices[0], id: 'risk', affinity: { riskTolerance: 1 } },
      { ...event.choices[0], id: 'own', affinity: { autonomy: 1 } },
    ];
    const relaxed = automaticChoices(
      {
        ...game,
        state: { ...game.state, energy: 100, stress: 0, autonomyConflict: 0 },
      },
      local,
    );
    const strained = automaticChoices(
      {
        ...game,
        state: { ...game.state, energy: 10, stress: 90, autonomyConflict: 90 },
      },
      local,
    );
    expect(strained[0].weight).toBeGreaterThan(relaxed[0].weight);
    expect(strained[1].weight).toBeLessThan(relaxed[1].weight);
    expect(strained[2].weight).toBeGreaterThan(relaxed[2].weight);
  });
  it('选择页和结果页保存读取后，自动续播结果相同且不更改存档格式', () => {
    const choice = newGame(registry, 'AUTO-SAVE');
    const result = stepAutomatically(choice, registry);
    for (const game of [choice, result]) {
      const restored = deserialize(serialize(game), registry).game;
      expect(restored.schemaVersion).toBe(1);
      expect(restored).not.toHaveProperty('playing');
      expect(finish(restored)).toEqual(finish(game));
    }
  });
  it('手动接管和自动推进复用同一历史，之后仍可自动到达结局', () => {
    const result = stepAutomatically(newGame(registry, 'TAKEOVER'), registry);
    const next = advance(result, registry);
    const event = registry.events.find((e) => e.id === next.currentEventId)!;
    const manual = choose(
      next,
      registry,
      event.choices.filter((c) => matches(c.requirements, next.state)).at(-1)!
        .id,
    );
    const ending = finish(manual);
    expect(ending.state.history.slice(0, 2)).toEqual(manual.state.history);
  });
  it('新内容包无需改动策略代码即可自动演化', () => {
    const extended = createRegistry([...corePacks, testAlternatePack]);
    let game = advance(
      {
        ...newGame(registry),
        state: {
          ...initialState('EXTENDED-AUTO'),
          year: 1995,
          age: 24,
          tags: ['penn', 'test_pack_enabled'],
        },
      },
      extended,
    );
    for (let i = 0; i < 8 && game.phase !== 'ending'; i++)
      game = stepAutomatically(game, extended);
    expect(game.endingId).toBe('test_open_question');
  });
  it('结局是停留态，多次自动步进不会开始新人生', () => {
    const ending = finish(newGame(registry, 'END-AUTO'));
    expect(stepAutomatically(ending, registry)).toBe(ending);
    expect(selectAutomaticChoice(ending, registry)).toBeNull();
    expect(readingDelay(ending, registry, 1)).toBe(0);
  });
  it('倍速缩短阅读时间，但结果页至少停留两秒', () => {
    const game = newGame(registry);
    expect(readingDelay(game, registry, 2)).toBe(
      readingDelay(game, registry, 1) / 2,
    );
    expect(readingDelay(game, registry, 4)).toBeGreaterThanOrEqual(2000);
    expect(
      readingDelay(stepAutomatically(game, registry), registry, 4),
    ).toBeGreaterThanOrEqual(2000);
  });
  it('随机开播生成新的种子，不修改任何现有状态', () => {
    const seeds = Array.from({ length: 50 }, () => freshWorldSeed());
    expect(new Set(seeds).size).toBe(50);
    expect(
      seeds.every((s) => /^MUSK-[A-Z0-9]+(?:-[A-Z0-9]+){3}$/.test(s)),
    ).toBe(true);
  });
});

describe('页面计时与中断', () => {
  afterEach(() => vi.useRealTimers());
  function setup() {
    vi.useFakeTimers({
      toFake: ['setInterval', 'clearInterval', 'performance'],
    });
    return {
      isCurrent: vi.fn(() => true),
      onRemaining: vi.fn(),
      onElapsed: vi.fn(),
      onError: vi.fn(),
    };
  }
  it('到时只触发一步，不将选择和结果页一并跳过', () => {
    const callbacks = setup();
    startPlaybackClock(2000, callbacks);
    vi.advanceTimersByTime(1800);
    expect(callbacks.onElapsed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(callbacks.onElapsed).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(10000);
    expect(callbacks.onElapsed).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['暂停', '手动接管', '读取存档', '切换内容包', '关闭组件'])(
    '%s取消等待，不留下旧回调',
    () => {
      const callbacks = setup();
      const cancel = startPlaybackClock(2000, callbacks);
      vi.advanceTimersByTime(1800);
      cancel();
      cancel();
      vi.advanceTimersByTime(10000);
      expect(callbacks.onElapsed).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it.each(['后台页面', '面板打开', '存档错误', '旧世界线'])(
    '%s让快照失效时不推进',
    () => {
      const callbacks = setup();
      startPlaybackClock(2000, callbacks);
      callbacks.isCurrent.mockReturnValue(false);
      vi.advanceTimersByTime(5000);
      expect(callbacks.onElapsed).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it('更新倒计时过程中被接管，也不能执行刚到期的选择', () => {
    const callbacks = setup();
    callbacks.onRemaining.mockImplementation(() =>
      callbacks.isCurrent.mockReturnValue(false),
    );
    startPlaybackClock(200, callbacks);
    vi.advanceTimersByTime(1000);
    expect(callbacks.onElapsed).not.toHaveBeenCalled();
  });
  it('规则执行错误只上报一次并停止时钟', () => {
    const callbacks = setup();
    callbacks.onElapsed.mockImplementation(() => {
      throw new Error('内容缺失');
    });
    startPlaybackClock(200, callbacks);
    vi.advanceTimersByTime(10000);
    expect(callbacks.onError).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('重复启动前清理旧时钟，只有新等待能触发', () => {
    const callbacks = setup();
    const cancel = startPlaybackClock(2000, callbacks);
    vi.advanceTimersByTime(1000);
    cancel();
    startPlaybackClock(2000, callbacks);
    vi.advanceTimersByTime(1000);
    expect(callbacks.onElapsed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(callbacks.onElapsed).toHaveBeenCalledTimes(1);
  });
});
