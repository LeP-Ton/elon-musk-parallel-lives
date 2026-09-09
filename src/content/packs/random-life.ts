import type { ContentPack, RandomEventDefinition } from '../../game/types';
const base = {
  chapter: '人生插曲',
  truthType: 'ALTERNATE' as const,
  historicalConfidence: 'alternate' as const,
  storyRole: 'random' as const,
  once: true,
  cooldown: 3,
  priority: 118,
  baseWeight: 35,
};
const randomEvents: RandomEventDefinition[] = [
  {
    ...base,
    id: 'late_coffee',
    title: '顺便聊一会儿',
    pool: 'relationship',
    category: 'relationship',
    cooldownGroup: 'connection',
    conditions: [
      { tag: 'queens' },
      { tag: 'penn', absent: true },
      { field: 'year', gte: 1992, lte: 1992 },
    ],
    scene: {
      location: '大学 · 图书馆外',
      year: 1992,
      timeOfDay: '午后',
      backgroundKey: 'university_campus',
      atmosphere: '有时，机会不是正式的邀请。',
      openingNarrative:
        '你准备离开图书馆时，一个同学叫住了你。他知道你会写程序，想介绍你认识正在做软件的人。\n\n没有承诺，只是一杯咖啡的时间。作业还等着你，但人和人之间的联系，往往没有课程表。',
    },
    choices: [
      {
        id: 'coffee',
        text: '留下来聊聊。',
        hint: '看看别人在解决什么问题。',
        outcomes: [
          {
            id: 'connected',
            weight: 1,
            narrative:
              '你们聊得比预想更久。回去时，纸上多了一个电话号码，也多了一个你想自己试试的念头。',
            effects: [{ stat: 'network', delta: 8 }],
            addTags: ['chance_connection'],
          },
        ],
      },
      {
        id: 'study',
        text: '交换联系方式，今天先完成作业。',
        hint: '不必抓住每一次偶遇。',
        outcomes: [
          {
            id: 'focused',
            weight: 1,
            narrative:
              '你没有把偶遇变成整天的安排。夜里，作业做完，你把那个号码认真抄进本子里。',
            effects: [{ stat: 'technical', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    ...base,
    id: 'server_night',
    title: '服务器停下的夜晚',
    pool: 'engineering',
    category: 'crisis',
    cooldownGroup: 'crisis',
    conditions: [
      { tag: 'zip2_started' },
      { tag: 'zip2_funded', absent: true },
      { field: 'year', gte: 1996, lte: 1998 },
    ],
    scene: {
      location: '美国 · 创业办公室',
      year: 1996,
      timeOfDay: '凌晨',
      backgroundKey: 'office_1990s',
      atmosphere: '机器不会因为你的野心而少出一次故障。',
      openingNarrative:
        '页面停止响应。明天的演示近在眼前，而你已经盯着屏幕坐了太久。\n\n这可能只是一个小错误，也可能说明整个实现都需要重做。你把手放在键盘上，又停下来：现在最紧缺的，也许不只有时间。',
    },
    choices: [
      {
        id: 'fix',
        text: '先定位最小故障，恢复演示。',
        hint: '克制重构冲动，先让系统活下来。',
        outcomes: [
          {
            id: 'recovered',
            weight: 1,
            narrative:
              '问题比想象中小，也更隐蔽。你修好了它，却没有趁机改写整套代码。\n\n天亮时，页面重新出现。今天，足够好有了一个可以接受的含义。',
            effects: [
              { stat: 'technical', delta: 5 },
              { stat: 'energy', delta: -10 },
            ],
          },
        ],
      },
      {
        id: 'rest',
        text: '先睡一会儿，再和 Kimbal 一起排查。',
        hint: '用休息换取更清晰的判断。',
        outcomes: [
          {
            id: 'rested',
            weight: 1,
            narrative:
              '醒来之后，那段看了几十遍的代码终于暴露了问题。你没能多出几个小时，却重新得到了能思考的头脑。',
            effects: [
              { stat: 'energy', delta: 12 },
              { stat: 'stress', delta: -8 },
            ],
          },
        ],
      },
    ],
  },
  {
    ...base,
    id: 'quiet_weekend',
    title: '一个没有会议的周末',
    pool: 'burnout',
    category: 'reflection',
    cooldownGroup: 'recovery',
    conditions: [
      { tag: 'stayed' },
      { tag: 'employed' },
      { field: 'stress', gte: 25 },
      { field: 'year', gte: 1997, lte: 1998 },
    ],
    scene: {
      location: '美国 · 公寓',
      year: 1997,
      timeOfDay: '周日早晨',
      backgroundKey: 'office_1990s',
      atmosphere: '安静，也会把问题放大。',
      openingNarrative:
        '闹钟没有响。阳光在桌上移动，你一时竟不知道该先做什么。\n\n桌边有公司的资料，也有你一直没有动手的个人项目。没人催促你，但不做点什么的念头让你不习惯。',
    },
    choices: [
      {
        id: 'walk',
        text: '关上电脑，出去走走。',
        hint: '给精力一点恢复的时间。',
        outcomes: [
          {
            id: 'breathe',
            weight: 1,
            narrative:
              '你走了很远。那些问题没有消失，只是不再全部挤在眼前。\n\n回家时，你第一次给笔记本留了一页空白。',
            effects: [
              { stat: 'energy', delta: 15 },
              { stat: 'stress', delta: -10 },
            ],
          },
        ],
      },
      {
        id: 'build',
        text: '做一点自己的原型。',
        hint: '未解决的问题正在增加吸引力。',
        outcomes: [
          {
            id: 'prototype',
            weight: 1,
            narrative:
              '原型还不能给别人看，你却第一次在这个周末感到放松。\n\n你开始怀疑，自己疲惫的原因，究竟是做得太多，还是想做的事情一直没能开始。',
            effects: [
              { stat: 'technical', delta: 5 },
              { stat: 'autonomyConflict', delta: 8 },
            ],
          },
        ],
      },
    ],
  },
];
export const randomLife: ContentPack = {
  id: 'random-life',
  version: '1.0.0',
  requires: ['silicon-valley'],
  tags: ['chance_connection'],
  randomEvents,
};
