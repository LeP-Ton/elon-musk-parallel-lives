import type { Game, Registry } from './types';
import { advance, choose, narrativeText } from '../engine/runtime';
import { matches } from '../engine/conditions';
type Context = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export function registerGameTools(
  context: Context | undefined,
  getGame: () => Game,
  getRegistry: () => Registry,
  commit: (game: Game) => void,
) {
  const lifecycle = new AbortController();
  if (!context?.registerTool) return () => lifecycle.abort();
  const read = () => {
    const game = getGame();
    const r = getRegistry();
    const e = r.events.find((e) => e.id === game.currentEventId);
    const h = game.state.history.at(-1);
    return {
      phase: game.phase,
      year: game.state.year,
      eventId: game.currentEventId,
      ending: r.endings.find((e) => e.id === game.endingId)?.narrative,
      story: e
        ? game.phase === 'result'
          ? e.choices
              .find((c) => c.id === h?.choiceId)
              ?.outcomes.find((o) => o.id === h?.outcomeId)?.narrative
          : narrativeText(e, game.state)
        : undefined,
      choices:
        game.phase === 'choice'
          ? e?.choices
              .filter((c) => matches(c.requirements, game.state))
              .map((c) => ({ id: c.id, text: c.text }))
          : [],
    };
  };
  const tools = [
    {
      name: 'read_current_scene',
      description: '读取当前人生场景、结果或结局以及可用选择。',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: () => read(),
    },
    {
      name: 'choose_life_action',
      description:
        '在当前选择页执行一个行动，结算结果并更新可见人生与自动存档。',
      inputSchema: {
        type: 'object',
        properties: { choiceId: { type: 'string' } },
        required: ['choiceId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: (input: unknown) => {
        if (
          !input ||
          typeof input !== 'object' ||
          !('choiceId' in input) ||
          typeof input.choiceId !== 'string'
        )
          throw Error('必须提供 choiceId');
        commit(choose(getGame(), getRegistry(), input.choiceId));
        return read();
      },
    },
    {
      name: 'continue_life_story',
      description: '阅读结果之后推进到下一个场景或阶段结局。',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: () => {
        if (getGame().phase !== 'result') throw Error('只能从结果页继续');
        commit(advance(getGame(), getRegistry()));
        return read();
      },
    },
  ];
  for (const tool of tools)
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {
      /* 不支持提案的浏览器不影响正常游玩。 */
    }
  return () => lifecycle.abort();
}
export type { Context as GameModelContext };
