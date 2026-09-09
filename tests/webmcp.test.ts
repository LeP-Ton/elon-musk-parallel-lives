import { expect, it } from 'vitest';
import { registerGameTools, type GameModelContext } from '../src/game/webmcp';
import { newGame } from '../src/engine/runtime';
import { registry } from '../src/content/registry';
it('结构化交互工具复用游戏状态，拒绝非法输入并按生命周期注销', () => {
  let game = newGame(registry);
  const tools: Parameters<GameModelContext['registerTool']>[0][] = [];
  let signal: AbortSignal | undefined;
  const context: GameModelContext = {
    registerTool(tool, options) {
      tools.push(tool);
      signal = options.signal;
    },
  };
  const cleanup = registerGameTools(
    context,
    () => game,
    () => registry,
    (g) => {
      game = g;
    },
  );
  expect(tools.map((t) => t.name)).toEqual([
    'read_current_scene',
    'choose_life_action',
    'continue_life_story',
  ]);
  expect(tools[0].annotations.readOnlyHint).toBe(true);
  expect(tools[1].annotations.readOnlyHint).toBe(false);
  expect(() => tools[1].execute({ choiceId: 'missing' })).toThrow();
  expect(game.state.history).toHaveLength(0);
  expect(() => tools[1].execute({})).toThrow();
  tools[1].execute({ choiceId: 'code' });
  expect(game.phase).toBe('result');
  tools[2].execute({});
  expect(game.currentEventId).toBe('blastar');
  expect(tools[0].execute({})).toMatchObject({
    eventId: 'blastar',
    phase: 'choice',
  });
  expect(() => tools[2].execute({})).toThrow();
  cleanup();
  expect(signal?.aborted).toBe(true);
});
