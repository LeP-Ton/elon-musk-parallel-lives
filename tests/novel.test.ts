import { describe, expect, it } from 'vitest';
import { registry, corePacks } from '../src/content/registry';
import {
  newGame,
  advance,
  choose,
  availableChoices,
  currentText,
} from '../src/engine/runtime';
import {
  stepAutomatically,
  selectAutomaticChoice,
  readingDelay,
} from '../src/engine/autoplay';
import { matches } from '../src/engine/conditions';
import {
  deserialize,
  serialize,
  saveSlot,
  legacyBackups,
  SAVE_PREFIX,
} from '../src/game/save';
import { validateContent } from '../src/engine/validator';
import { registerGameTools, type GameModelContext } from '../src/game/webmcp';
import type { Game, ContentPack } from '../src/game/types';

function toDecision(game: Game) {
  while (game.phase !== 'choice' && game.phase !== 'ending')
    game = advance(game, registry);
  return game;
}
function run(
  seed: string,
  policy: Record<string, string> = {},
  until?: string,
) {
  let game = newGame(registry, seed);
  let text = '';
  for (let n = 0; n < 2000 && game.phase !== 'ending'; n++) {
    if (game.currentEventId === until) return { game, text };
    text += currentText(game, registry);
    game =
      game.phase === 'choice' && policy[game.currentEventId!]
        ? choose(game, registry, policy[game.currentEventId!])
        : stepAutomatically(game, registry);
  }
  return { game, text };
}

describe('视觉小说场内状态图', () => {
  it('具有42个主分支、6个插曲、5结局、46立绘契约、8背景', () => {
    expect(registry.events.filter((e) => e.storyRole !== 'minor')).toHaveLength(
      42,
    );
    expect(registry.events.filter((e) => e.storyRole === 'minor')).toHaveLength(
      6,
    );
    expect(registry.endings).toHaveLength(5);
    expect(registry.assets.filter((a) => a.type === 'character')).toHaveLength(
      46,
    );
    expect(registry.assets.filter((a) => a.type === 'background')).toHaveLength(
      8,
    );
    expect(validateContent(corePacks)).toEqual([]);
  });
  it('对白不能提前选择，选择节点不能被继续接口跳过', () => {
    const game = newGame(registry);
    expect(game.phase).toBe('reading');
    expect(availableChoices(game, registry)).toEqual([]);
    expect(selectAutomaticChoice(game, registry)).toBeNull();
    expect(() => choose(game, registry, 'promise')).toThrow();
    const decision = toDecision(game);
    expect(decision.state.year).toBe(1983);
    expect(() => advance(decision, registry)).toThrow('选择');
    const result = choose(decision, registry, 'promise');
    expect(result.state.year).toBe(1983);
    expect(() => choose(result, registry, 'promise')).toThrow();
    expect(advance(result, registry).currentEventId).toBe('room');
  });
  it('同一承诺在下一幕获得不同回应，读对白不会再次结算效果', () => {
    const first = toDecision(newGame(registry));
    let game = choose(first, registry, 'promise');
    const trust = game.state.relationships.maye;
    for (let i = 0; i < 4; i++) game = advance(game, registry);
    expect(game.state.relationships.maye).toBe(trust);
    const kept = run(
      'PROMISE',
      { room: 'promise', breakfast: 'keep' },
      'blastar-reply',
    ).game;
    const broken = run(
      'PROMISE',
      { room: 'promise', breakfast: 'break' },
      'blastar-reply',
    ).game;
    expect(currentText(kept, registry)).toContain('你做到了');
    expect(currentText(broken, registry)).toContain('一直替你把饭留着');
  });
  it('关系改变后续机会，工程师转创业保留原工作与隐私记忆', () => {
    const policy = {
      crossroads: 'engineer',
      'engineer-lobby': 'specific',
      'engineer-test': 'tested',
      'engineer-release': 'privacy',
      'echo-privacy': 'aggregate',
    };
    const g = toDecision(run('JOIN', policy, 'engineer-exit').game);
    expect(availableChoices(g, registry).map((c) => c.id)).toContain('startup');
    const bad = {
      ...g,
      state: {
        ...g.state,
        relationships: { ...g.state.relationships, dan: 30 },
      },
    };
    expect(availableChoices(bad, registry).map((c) => c.id)).not.toContain(
      'startup',
    );
    expect(() => choose(bad, registry, 'startup')).toThrow();
    const joined = run('JOIN', { ...policy, 'engineer-exit': 'startup' }).game;
    expect(joined.endingId).toBe('founder');
    expect(joined.state.promises.privacy).toBe('kept');
    expect(joined.visitedScenes).toContain('engineer-test');
    expect(joined.state.tags).toContain('late-founder');
  });
  it('至少六条跨场景承诺链有可观察的回应', () => {
    const chains = [
      ['letter', { packing: 'letter', 'letter-home': 'truth' }, 'echo-letter'],
      ['credit', { seminar: 'revise', 'credit-page': 'credit' }, 'echo-credit'],
      ['rest', { roommate: 'quiet', crossroads: 'founder' }, 'echo-rest'],
      [
        'privacy',
        { crossroads: 'engineer', 'engineer-release': 'privacy' },
        'echo-privacy',
      ],
      [
        'license',
        { crossroads: 'games', 'games-contract': 'limited' },
        'echo-license',
      ],
      [
        'research',
        {
          crossroads: 'research',
          'research-method': 'reproduce',
          'research-results': 'negative',
        },
        'echo-record',
      ],
    ] as [string, Record<string, string>, string][];
    for (const [promise, policy, scene] of chains) {
      const game = run('CHAINS', policy).game;
      expect(game.visitedScenes, promise).toContain(scene);
      expect(game.state.promises[promise]).toBeDefined();
    }
  });
  it('1000种子完整演化：无死路、五类结局、全部场景覆盖、正文规模', () => {
    const endings = new Set<string>();
    const visited = new Set<string>();
    let min = Infinity,
      max = 0;
    for (let i = 0; i < 1000; i++) {
      const { game, text } = run(`VN-${i}`);
      expect(game.phase).toBe('ending');
      expect(game.state.year).toBe(1999);
      expect(
        matches(
          registry.endings.find((e) => e.id === game.endingId)!.conditions,
          game.state,
        ),
      ).toBe(true);
      expect(game.visitedScenes.length).toBeGreaterThanOrEqual(24);
      expect(game.visitedScenes.length).toBeLessThanOrEqual(32);
      game.visitedScenes.forEach((id) => visited.add(id));
      endings.add(game.endingId!);
      // 字数统计使用汉字，不把ID、标点、英文和重复无障碍文本算作正文。
      const count = (text.match(/\p{Script=Han}/gu) ?? []).length;
      min = Math.min(min, count);
      max = Math.max(max, count);
    }
    expect(endings.size).toBe(5);
    expect(visited.size).toBe(48);
    expect(min).toBeGreaterThanOrEqual(12000);
    expect(max).toBeLessThanOrEqual(18000);
  }, 60000);
  it('同种子同选择复现；阅读速度和回看文本不改变结果', () => {
    expect(run('SAME').game).toEqual(run('SAME').game);
    const game = toDecision(newGame(registry, 'SAME'));
    const before = structuredClone(game);
    [1, 2, 4].forEach((speed) => {
      readingDelay(game, registry, speed as 1 | 2 | 4);
      currentText(game, registry);
    });
    expect(game).toEqual(before);
    expect(stepAutomatically(game, registry)).toEqual(
      choose(game, registry, selectAutomaticChoice(game, registry)!.id),
    );
  });
});

describe('新版存档与工具接口', () => {
  it('对白中途、选择前后和结局恢复完全一致，不重抽、不重复关系', () => {
    const first = advance(newGame(registry), registry);
    const decision = toDecision(first);
    const result = choose(decision, registry, 'promise');
    for (const g of [first, decision, result, run('SAVE-FINAL').game])
      expect(deserialize(serialize(g), registry).game).toEqual(g);
    expect(
      advance(deserialize(serialize(result), registry).game, registry),
    ).toEqual(advance(result, registry));
  });
  it('不接受越过选择的游标、伪造关系、重复效果与失真的日志', () => {
    for (const mutate of [
      (g: Game) => {
        g.nodeId = 'after-0';
      },
      (g: Game) => {
        g.state.relationships.maye = 99;
      },
      (g: Game) => {
        g.transcript.push({ eventId: 'room', nodeId: 'line-0' });
      },
      (g: Game) => {
        g.state.promises.dinner = 'kept';
      },
    ]) {
      const g = advance(newGame(registry), registry);
      mutate(g);
      expect(() => deserialize(serialize(g), registry)).toThrow();
    }
  });
  it('旧档保持原始字节，v2独立保存，v1导入明确要求重开', () => {
    const old = '{"game":{"schemaVersion":1},"savedAt":"old"}';
    const map = new Map([['parallel-lives:v1:0', old]]);
    const storage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => map.set(k, v),
    } as unknown as Storage;
    saveSlot(storage, 0, newGame(registry));
    expect(SAVE_PREFIX).toBe('parallel-lives:v2:');
    expect(map.get('parallel-lives:v1:0')).toBe(old);
    expect(legacyBackups(storage)).toEqual([{ slot: 0, raw: old }]);
    expect(() => deserialize(old, registry)).toThrow('旧版');
  });
  it('结构化工具逐句读取和推进，不能提前选择或越过选择', () => {
    let game = newGame(registry);
    const tools: Parameters<GameModelContext['registerTool']>[0][] = [];
    const dispose = registerGameTools(
      {
        registerTool: (t) => {
          tools.push(t);
        },
      },
      () => game,
      () => registry,
      (g) => {
        game = g;
      },
    );
    expect(tools[0].execute({})).toMatchObject({
      phase: 'reading',
      nodeId: 'line-0',
      choices: [],
    });
    expect(() => tools[1].execute({ choiceId: 'promise' })).toThrow();
    tools[2].execute({});
    expect(game.nodeId).toBe('line-1');
    while (game.phase === 'reading') tools[2].execute({});
    expect(() => tools[2].execute({})).toThrow();
    tools[1].execute({ choiceId: 'promise' });
    expect(game.phase).toBe('result');
    dispose();
  });
});

describe('声明式内容安全检查', () => {
  it('检查缺图、错误年代、断链、不可达、循环与缺少条件出口', () => {
    const bad = structuredClone(corePacks) as ContentPack[];
    const e = bad[0].events![0];
    const nodes = e.scene.script!.nodes;
    nodes.push({
      id: 'orphan',
      type: 'narration',
      text: '不可达',
      next: 'missing',
    });
    nodes.push({
      id: 'loop',
      type: 'branch',
      branches: [{ when: [], next: 'loop' }],
      fallback: '',
    });
    const first = nodes[0];
    if ('cast' in first)
      first.cast = [{ character: 'elon-adult', expression: 'happy' }];
    e.scene.script!.entry = 'loop';
    const errors = validateContent(bad).join('\n');
    for (const term of ['年代', '断链', '不可达', '循环', '出口'])
      expect(errors).toContain(term);
  });
});
