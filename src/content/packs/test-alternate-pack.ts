import type { ContentPack } from '../../game/types';
/** 仅在开发检查器开启；只注册数据，不侵入任何运行时或主页面。 */
export const testAlternatePack: ContentPack = {
  id: 'test-alternate-pack',
  entryTags: ['test_pack_enabled'],
  version: '1.0.0',
  requires: ['early-life'],
  tags: ['test_pack_enabled', 'test_invited', 'test_finished'],
  assets: [
    {
      id: 'test_lab',
      type: 'background',
      path: '/assets/campus.png',
      era: '1990s',
    },
  ],
  events: [
    {
      id: 'test_research_invitation',
      title: '来自另一间实验室的信',
      chapter: '扩展篇 · 另一扇窗',
      truthType: 'ALTERNATE',
      historicalConfidence: 'alternate',
      priority: 200,
      storyRole: 'major',
      category: 'opportunity',
      conditions: [
        { tag: 'test_pack_enabled' },
        { tag: 'penn' },
        { field: 'year', gte: 1995, lte: 1999 },
      ],
      scene: {
        location: '大学 · 研究办公室',
        year: 1995,
        timeOfDay: '上午',
        backgroundKey: 'test_lab',
        atmosphere: '旧的人生，也能遇到新的机会。',
        openingNarrative:
          '一间实验室看过你的程序，邀请你把模拟方法用在能源研究上。\n\n这封信原本不在你的计划里。它没有改变你已经走过的路，却在眼前多开了一扇窗。',
      },
      choices: [
        {
          id: 'visit',
          text: '去看看他们的问题。',
          hint: '进入新增的内容篇章。',
          outcomes: [
            {
              id: 'invited',
              weight: 1,
              narrative:
                '你答应参加一次讨论。对方寄来一组数据，你发现自己已经忍不住开始计算。',
              addTags: ['test_invited'],
            },
          ],
        },
      ],
    },
  ],
  randomEvents: [
    {
      id: 'test_data_anomaly',
      title: '数据里的裂缝',
      chapter: '扩展篇 · 意外发现',
      truthType: 'ALTERNATE',
      historicalConfidence: 'alternate',
      priority: 220,
      storyRole: 'random',
      pool: 'research',
      baseWeight: 10,
      once: true,
      cooldown: 2,
      category: 'technology',
      conditions: [{ tag: 'test_invited' }],
      scene: {
        location: '大学 · 实验室',
        year: 1995,
        timeOfDay: '傍晚',
        backgroundKey: 'test_lab',
        atmosphere: '异常有时是另一个问题的入口。',
        openingNarrative:
          '一行数据与预期不同。它可能只是测量误差，也可能是模型忽略了一件事。\n\n你请求重新检查原始记录。天色渐暗，讨论却才刚开始。',
      },
      choices: [
        {
          id: 'investigate',
          text: '留在这里，把异常追到底。',
          hint: '让一个新问题改变方向。',
          outcomes: [
            {
              id: 'research',
              weight: 1,
              narrative: '你找到一个值得继续研究的疑点。合作由此开始。',
              addTags: ['test_finished'],
              career: '研究工程师',
              year: 1999,
              deviation: 50,
            },
          ],
        },
      ],
    },
  ],
  endings: [
    {
      id: 'test_open_question',
      title: '仍未解开的题',
      subtitle: 'AN OPEN QUESTION',
      conditions: [{ tag: 'test_finished' }],
      narrative:
        '新增的一封信，改变了一个已经开始的人生。\n\n你带着旧经历走进新实验室；未知并没有因为故事结束而消失。',
    },
  ],
};
