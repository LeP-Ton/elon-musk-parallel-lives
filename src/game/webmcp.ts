import type { Game, Registry } from './types';
import {
  advance,
  choose,
  currentText,
  availableChoices,
  currentNode,
} from '../engine/runtime';
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
    return {
      phase: game.phase,
      year: game.state.year,
      eventId: game.currentEventId,
      ending: r.endings.find((e) => e.id === game.endingId)?.narrative,
      nodeId: game.nodeId,
      node: currentNode(game, r)?.type,
      story: currentText(game, r),
      choices: availableChoices(game, r).map((c) => ({
        id: c.id,
        text: c.text,
      })),
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
      description:
        '推进一段对白、阅读选择结果或进入下一幕；不能跳过尚未作出的选择。',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: () => {
        if (!['reading', 'result'].includes(getGame().phase))
          throw Error('请先作出选择，或人生已经结束');
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
