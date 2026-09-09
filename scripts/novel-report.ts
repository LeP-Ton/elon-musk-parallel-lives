import { registry } from '../src/content/registry';
import { currentText, newGame } from '../src/engine/runtime';
import { stepAutomatically } from '../src/engine/autoplay';

/** 统计实际走到的节点；只统计正文，不把未走到的分支或界面副本冒充单轮阅读量。 */
const counts: Record<string, number> = {};
let minWords = Infinity,
  maxWords = 0,
  minScenes = Infinity,
  maxScenes = 0;
const seen = new Set<string>();
for (let i = 0; i < 1000; i++) {
  let game = newGame(registry, `VN-${i}`),
    words = 0;
  for (let step = 0; step < 2000 && game.phase !== 'ending'; step++) {
    words += (currentText(game, registry).match(/\p{Script=Han}/gu) ?? [])
      .length;
    game = stepAutomatically(game, registry);
  }
  if (game.phase !== 'ending') throw Error(`世界线未结束：${i}`);
  game.visitedScenes.forEach((id) => seen.add(id));
  counts[game.endingId!] = (counts[game.endingId!] ?? 0) + 1;
  minWords = Math.min(minWords, words);
  maxWords = Math.max(maxWords, words);
  minScenes = Math.min(minScenes, game.visitedScenes.length);
  maxScenes = Math.max(maxScenes, game.visitedScenes.length);
}
console.log(
  JSON.stringify(
    {
      样本: 1000,
      主分支场景: registry.events.filter((e) => e.storyRole !== 'minor').length,
      条件插曲: registry.events.filter((e) => e.storyRole === 'minor').length,
      覆盖场景: seen.size,
      单轮场景数: [minScenes, maxScenes],
      单轮正文汉字数不含结局: [minWords, maxWords],
      结局分布: counts,
      时长说明: '45～90分钟是目标；此处不以自动推演耗时替代真人阅读时长验收。',
    },
    null,
    2,
  ),
);
