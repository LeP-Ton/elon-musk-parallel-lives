import { describe, expect, it } from 'vitest';
// 旧内容保留为引擎回归夹具；新版完整路线另见 novel.test.ts。
import {
  legacyPacks as corePacks,
  createRegistry,
  legacyRegistry as registry,
} from '../src/content/registry';
import { testAlternatePack } from '../src/content/packs/test-alternate-pack';
import {
  advance,
  applyEffects,
  choose,
  initialState,
  narrativeText,
  newGame,
} from '../src/engine/runtime';
import { matches, reasons } from '../src/engine/conditions';
import { calculateChoiceFit } from '../src/engine/personality';
import { outcomeWeights } from '../src/engine/probability';
import { inspectCandidates, scheduleNextEvent } from '../src/engine/scheduler';
import { random, weightedIndex } from '../src/engine/rng';
import { deserialize, loadSlot, saveSlot, serialize } from '../src/game/save';
import { validateContent } from '../src/engine/validator';
import type { ContentPack, Game } from '../src/game/types';

const event = (id: string) => registry.events.find((e) => e.id === id)!;
function play(seed: string, policy: Record<string, string> = {}) {
  let game = newGame(registry, seed);
  for (let i = 0; i < 60 && game.phase !== 'ending'; i++) {
    const e = event(game.currentEventId!);
    const c =
      e.choices.find((c) => c.id === policy[e.id]) ??
      e.choices.find((c) => matches(c.requirements, game.state))!;
    game = choose(game, registry, c.id);
    try {
      game = advance(game, registry);
    } catch (error) {
      throw new Error(
        `${String(error)}；种子 ${seed}；策略 ${JSON.stringify(policy)}；历史 ${game.state.history.map((h) => h.eventId + '/' + h.choiceId + '/' + h.outcomeId).join(' → ')}；标签 ${game.state.tags.join(',')}`,
      );
    }
  }
  expect(game.phase, `${seed} 未到达结局`).toBe('ending');
  return game;
}
const stablePolicy = {
  stanford: 'netscape',
  netscape: 'persist',
  engineer: 'stay',
  stable: 'stay_again',
  gravity: 'return',
};

describe('随机与选择', () => {
  it('同种子与同选择得到完全相同的世界线', () =>
    expect(play('REPLAY', stablePolicy)).toEqual(play('REPLAY', stablePolicy)));
  it('视觉随机流不影响剧情结果', () => {
    const before = play('COSMETIC');
    for (let i = 0; i < 100; i++) random('COSMETIC', 'cosmetic', 'rain', i);
    expect(play('COSMETIC')).toEqual(before);
  });
  it('不同流、事件、次数产生独立且稳定的抽样', () => {
    expect(random('S', 'outcome', 'a')).toBe(random('S', 'outcome', 'a'));
    expect(
      new Set(
        ['outcome', 'company', 'cosmetic'].map((s) =>
          random('S', s as 'outcome', 'a'),
        ),
      ).size,
    ).toBe(3);
    expect(random('S', 'outcome', 'a', 1)).not.toBe(
      random('S', 'outcome', 'a', 2),
    );
  });
  it('非法权重被拒绝，零权重不被抽中', () => {
    expect(() => weightedIndex([0, 0], 0.2)).toThrow();
    expect(() => weightedIndex([-1, 2], 0.2)).toThrow();
    expect(weightedIndex([0, 5], 0)).toBe(1);
  });
  it('能力和人脉改变 Netscape 录用权重', () => {
    const c = event('netscape').choices[0];
    expect(
      outcomeWeights(c, {
        ...initialState('S'),
        technical: 90,
        network: 80,
      })[0],
    ).toBeGreaterThan(outcomeWeights(c, initialState('S'))[0]);
  });
  it('同一求职选择可以得到不同合理结果', () => {
    const outcomes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const g = { ...newGame(registry, `N-${i}`), currentEventId: 'netscape' };
      outcomes.add(choose(g, registry, 'persist').state.history[0].outcomeId);
    }
    expect(outcomes.size).toBe(3);
  });
  it('结果页不能再次结算同一选择', () => {
    const g = choose(newGame(registry), registry, 'code');
    expect(() => choose(g, registry, 'code')).toThrow();
  });
});

describe('人物、条件与调度', () => {
  it('支持数值、标签、职业、历史和任一条件，能够解释锁定', () => {
    const s = { ...initialState('S'), tags: ['penn'] };
    expect(
      matches(
        [
          { field: 'technical', gte: 20 },
          { tag: 'penn' },
          { any: [[{ career: '学生' }], [{ tag: 'missing' }]] },
        ],
        s,
      ),
    ).toBe(true);
    expect(
      reasons([{ field: 'year', gte: 1998 }, { tag: 'employed' }], s),
    ).toHaveLength(2);
    expect(matches([{ history: 'childhood' }], s)).toBe(false);
  });
  it('失败经历使求稳更合理，但不硬锁人格选项', () => {
    const c = event('stable').choices[0];
    const s = initialState('S');
    expect(
      calculateChoiceFit(c, { ...s, tags: ['startup_failed'] }).score,
    ).toBeGreaterThan(calculateChoiceFit(c, s).score);
    expect(matches(c.requirements, s)).toBe(true);
  });
  it('效果有界、时间不倒退、自主冲突会累积', () => {
    const c = event('stable').choices[0];
    const s = {
      ...initialState('S'),
      year: 1998,
      age: 27,
      stress: 98,
      energy: 99,
    };
    const next = applyEffects(
      s,
      {
        ...c.outcomes[0],
        year: 1995,
        effects: [{ stat: 'energy', delta: 20 }],
      },
      c,
    );
    expect(next.year).toBe(1998);
    expect(next.energy).toBe(100);
    expect(next.autonomyConflict).toBeGreaterThan(20);
    expect(s.autonomyConflict).toBe(0);
  });
  it('同时候选时优先级、压力与紧迫性参与选择', () => {
    const s = {
      ...initialState('S'),
      year: 1998,
      age: 27,
      tags: ['stable_year', 'stayed', 'employed'],
      autonomyConflict: 70,
    };
    expect(scheduleNextEvent(registry, s)?.id).toBe('gravity');
    const rows = inspectCandidates(registry, s);
    expect(rows.find((c) => c.event.id === 'gravity')?.reasons).toEqual([]);
    const urgent = createRegistry([
      {
        id: 'urgent',
        version: '1',
        events: [
          {
            ...event('gravity'),
            id: 'a',
            conditions: [],
            priority: 0,
            expiresAt: 1998,
            urgency: 100,
          },
          { ...event('gravity'), id: 'b', conditions: [], priority: 20 },
        ],
      },
    ]);
    expect(scheduleNextEvent(urgent, s)?.id).toBe('a');
  });
  it('随机事件仅进入合理状态下的池，插曲不会连续淹没主线', () => {
    const s = {
      ...initialState('S'),
      year: 1996,
      age: 25,
      tags: ['zip2_started'],
    };
    const first = scheduleNextEvent(registry, s);
    expect(first?.id).toBe('server_night');
    const g = { ...newGame(registry), state: s, currentEventId: first!.id };
    const next = advance(choose(g, registry, 'fix'), registry);
    expect(next.currentEventId).toBe('pitch');
    expect(
      inspectCandidates(registry, initialState('S')).find(
        (e) => e.event.id === 'server_night',
      )!.reasons.length,
    ).toBeGreaterThan(0);
  });
  it('动态正文记住先前的拒绝', () =>
    expect(
      narrativeText(event('zip2'), {
        ...initialState('S'),
        tags: ['netscape_rejected'],
      }),
    ).toContain('没能带来工作的邮件'));
});

describe('整条人生与扩展', () => {
  it('多种种子和选择策略全部可达结局，覆盖全部核心事件', () => {
    const visited = new Set<string>();
    const endings = new Set<string>();
    const policies: Record<string, string>[] = [
      {},
      stablePolicy,
      { stanford: 'netscape', engineer: 'resign' },
      { stanford: 'games', publisher: 'studio' },
      {
        stanford: 'games',
        publisher: 'independent',
        engineer: 'stay',
        stable: 'spinout',
        gravity: 'boundaries',
      },
      { stanford: 'research' },
      { pitch: 'bootstrap' },
      {
        stanford: 'netscape',
        engineer: 'stay',
        stable: 'stay_again',
        gravity: 'boundaries',
      },
    ];
    for (let i = 0; i < 30; i++)
      for (const p of policies) {
        const g = play(`LIFE-${i}`, p);
        g.state.history.forEach((h) => visited.add(h.eventId));
        endings.add(g.endingId!);
      }
    for (const e of registry.events.filter((e) => e.storyRole !== 'random'))
      expect(visited.has(e.id), `不可达核心事件 ${e.id}`).toBe(true);
    expect(endings.size).toBe(5);
  });
  it('Netscape → 工程师 → Zip2 形成真实汇合且不抹除历史', () => {
    const g = Array.from({ length: 20 }, (_, i) =>
      play(`JOIN-${i}`, { stanford: 'netscape', engineer: 'resign' }),
    ).find((g) => g.state.history.some((h) => h.outcomeId === 'hired'))!;
    expect(g).toBeDefined();
    const ids = g.state.history.map((h) => h.eventId);
    expect(ids.indexOf('zip2')).toBeGreaterThan(ids.indexOf('engineer'));
    expect(g.state.tags).toContain('rejoined');
    expect(g.state.history.some((h) => h.deviation > 0)).toBe(true);
  });
  it('创业失败 → 求稳 → 人格冲突 → 再创业能够走通', () => {
    const g = Array.from({ length: 30 }, (_, i) =>
      play(`FAIL-${i}`, {
        engineer: 'stay',
        stable: 'stay_again',
        gravity: 'return',
      }),
    ).find((g) => g.state.tags.includes('startup_failed'))!;
    expect(g).toBeDefined();
    expect(g.state.history.map((h) => h.eventId)).toContain('gravity');
    expect(g.state.history.filter((h) => h.eventId === 'zip2')).toHaveLength(2);
  });
  it('新增包在旧状态生效，移除后原游戏保持有效', () => {
    const g = {
      ...newGame(registry),
      state: {
        ...initialState('OLD'),
        year: 1995,
        age: 24,
        tags: ['penn', 'test_pack_enabled'],
      },
    };
    const extended = createRegistry([...corePacks, testAlternatePack]);
    const first = advance(g, extended);
    expect(first.currentEventId).toBe('test_research_invitation');
    const second = advance(choose(first, extended, 'visit'), extended);
    expect(second.currentEventId).toBe('test_data_anomaly');
    expect(
      advance(choose(second, extended, 'investigate'), extended).endingId,
    ).toBe('test_open_question');
    expect(play('AFTER-REMOVAL').phase).toBe('ending');
  });
  it('缺失和循环依赖被拒绝', () => {
    expect(() =>
      createRegistry([{ id: 'a', version: '1', requires: ['b'] }]),
    ).toThrow('缺少');
    expect(() =>
      createRegistry([
        { id: 'a', version: '1', requires: ['b'] },
        { id: 'b', version: '1', requires: ['a'] },
      ]),
    ).toThrow('循环');
  });
});

describe('存档与校验器', () => {
  it('选择页、结果页和结局可往返读取，保存后重放不改变结果', () => {
    const first = newGame(registry);
    const result = choose(first, registry, 'code');
    for (const g of [first, result, play('SAVE')])
      expect(deserialize(serialize(g), registry).game).toEqual(g);
    expect(
      advance(deserialize(serialize(result), registry).game, registry),
    ).toEqual(advance(result, registry));
    expect(serialize(first)).not.toContain('openingNarrative');
  });
  it('旧存档允许加入新的内容包', () =>
    expect(
      deserialize(
        serialize(newGame(registry)),
        createRegistry([...corePacks, testAlternatePack]),
      ).game.schemaVersion,
    ).toBe(2));
  it('损坏、不兼容和篡改存档被拒绝', () => {
    expect(() => deserialize('oops', registry)).toThrow();
    for (const mutate of [
      (g: Game) => {
        g.state.energy = NaN;
      },
      (g: Game) => {
        g.currentEventId = 'missing';
      },
      (g: Game) => {
        g.state.simulationProfileVersion = 'unknown';
      },
      (g: Game) => {
        g.state.tags = ['typo'];
      },
    ]) {
      const g = newGame(registry);
      mutate(g);
      expect(() => deserialize(serialize(g), registry)).toThrow();
    }
  });
  it('多槽位独立保存，配额失败可解释', () => {
    const map = new Map<string, string>();
    const storage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        map.set(k, v);
      },
    } as Storage;
    saveSlot(storage, 1, newGame(registry, 'A'));
    saveSlot(storage, 2, newGame(registry, 'B'));
    expect(loadSlot(storage, 1, registry)?.game.state.seed).toBe('A');
    expect(loadSlot(storage, 2, registry)?.game.state.seed).toBe('B');
    expect(loadSlot(storage, 3, registry)).toBeNull();
    expect(() =>
      saveSlot(
        {
          setItem() {
            throw Error();
          },
        } as unknown as Storage,
        1,
        newGame(registry),
      ),
    ).toThrow('存档');
  });
  it('全部核心内容与测试包通过校验', () =>
    expect(validateContent([...corePacks, testAlternatePack])).toEqual([]));
  it('检出重复 ID、错误引用、缺失来源、非法概率与不可能结局', () => {
    const bad = structuredClone(corePacks) as ContentPack[];
    const e = bad[0].events![0];
    e.sourceRefs = [];
    e.scene.backgroundKey = 'missing';
    e.choices[0].outcomes[0].weight = -1;
    e.choices[0].outcomes[0].nextEventId = 'missing';
    e.choices[0].outcomes[0].narrative = '';
    e.choices[0].outcomes[0].addTags = ['typo'];
    bad[0].events!.push(structuredClone(e));
    bad[1].endings![0].conditions = [{ field: 'technical', gte: 200 }];
    const errors = validateContent(bad).join('\n');
    for (const term of [
      '重复',
      'sourceRefs',
      'background',
      'Weight',
      'nextEventId',
      'Narrative',
      '未声明',
      '永远不可满足',
    ])
      expect(errors).toContain(term);
  });
  it('检出没有冷却的可重复随机事件及不存在的角色', () => {
    const bad = structuredClone(corePacks);
    const e = bad[2].randomEvents![0];
    e.once = false;
    e.cooldown = undefined;
    e.scene.characterKeys = ['missing'];
    expect(validateContent(bad).join()).toContain('cooldown');
    expect(validateContent(bad).join()).toContain('character');
  });
});
