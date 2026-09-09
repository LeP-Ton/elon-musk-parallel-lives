import type { ContentPack, LifeEvent } from '../../game/types';
import { sources } from '../../research/sources';
/** 小型辅助函数仅提供默认元数据；剧情仍然是可以独立阅读的数据。 */
export const defineEvent = (event: LifeEvent): LifeEvent => event;
export const earlyLife: ContentPack = {
  id: 'early-life',
  version: '1.0.0',
  sources,
  tags: [
    'computer',
    'game_experience',
    'blastar_sold',
    'canada',
    'queens',
    'penn',
    'networking',
  ],
  assets: [
    {
      id: 'childhood_home',
      type: 'background',
      path: '/assets/childhood.png',
      era: '1980s',
    },
    {
      id: 'university_campus',
      type: 'background',
      path: '/assets/campus.png',
      era: '1990s',
    },
    {
      id: 'office_1990s',
      type: 'background',
      path: '/assets/office.png',
      era: '1990s',
    },
  ],
  events: [
    defineEvent({
      id: 'childhood',
      title: '光标闪烁的地方',
      chapter: '第一章 · 世界之外',
      truthType: 'CANON_DRAMATIZED',
      historicalConfidence: 'medium',
      sourceRefs: ['pbs-2021'],
      conditions: [{ field: 'year', gte: 1983, lte: 1983 }],
      priority: 100,
      storyRole: 'anchor',
      category: 'technology',
      scene: {
        location: '南非 · 比勒陀利亚',
        year: 1983,
        timeOfDay: '夜幕将至',
        backgroundKey: 'childhood_home',
        atmosphere: '窗外的世界很大，屏幕里的世界可以重写。',
        openingNarrative:
          '窗外，最后一缕日光正在退出房间。\n\n你把编程手册摊在膝上。屏幕上的光标一明一灭，像是在耐心等你说话。学校里那些难以理解的规则，此刻离得很远。这里的规则写在书里，可以拆开，可以验证，也可以改。\n\n你输入一行命令。机器回答了。\n\n如果它能够画出一个点，是不是也能画出一艘飞船？你翻过一页，晚餐的声音从门外传来。',
      },
      choices: [
        {
          id: 'code',
          text: '再试一次，让那艘飞船动起来。',
          hint: '顺着好奇心，走进一个自己能改变的世界。',
          affinity: { curiosity: 1, engineeringDrive: 1 },
          outcomes: [
            {
              id: 'learn',
              weight: 1,
              narrative:
                '飞船第一次穿过屏幕。你没有欢呼，只是立刻想知道，能不能让它再快一点。\n\n那天晚上，宇宙只有几千字节大，却足够装下一个新念头。',
              effects: [
                { stat: 'technical', delta: 15 },
                { stat: 'energy', delta: -6 },
              ],
              addTags: ['computer', 'game_experience'],
              year: 1984,
            },
          ],
        },
        {
          id: 'read',
          text: '先弄明白：电脑究竟怎样理解命令？',
          hint: '暂时放下游戏，拆开问题的底层逻辑。',
          affinity: { engineeringDrive: 1 },
          outcomes: [
            {
              id: 'understand',
              weight: 1,
              narrative:
                '你在纸上画满小方格，把机器如何存储一个数字重新推了一遍。\n\n第二天再坐到屏幕前时，黑色的盒子不再神秘。游戏依旧没有写完，但你开始知道怎样把它写出来。',
              effects: [{ stat: 'technical', delta: 20 }],
              addTags: ['computer', 'game_experience'],
              year: 1984,
            },
          ],
        },
      ],
    }),
    defineEvent({
      id: 'blastar',
      title: '寄往世界的一封信',
      chapter: '第一章 · 世界之外',
      truthType: 'CANON_DRAMATIZED',
      historicalConfidence: 'medium',
      sourceRefs: ['pbs-2021'],
      conditions: [
        { tag: 'computer' },
        { field: 'year', gte: 1984, lte: 1988 },
      ],
      priority: 90,
      storyRole: 'major',
      category: 'technology',
      scene: {
        location: '南非 · 家中',
        year: 1984,
        timeOfDay: '一个漫长的下午',
        backgroundKey: 'childhood_home',
        atmosphere: '第一次，你要让陌生人看见自己的作品。',
        openingNarrative:
          '程序已经能运行了。敌舰出现、移动，然后在像素拼出的爆炸里消失。你给它起名叫 Blastar。\n\n桌上放着一本计算机杂志。它印着别人的程序，也留着投稿地址。你把自己的代码打印出来，忽然发现：纸上的每一个错误，都可能被一个陌生人看见。\n\n继续改进，永远不会缺理由。可如果一直把它留在房间里，它就永远只属于这个房间。',
      },
      choices: [
        {
          id: 'submit',
          text: '把代码寄出去。它已经值得被玩一次。',
          hint: '作品将接受真实世界的检验。',
          affinity: { riskTolerance: 1 },
          outcomes: [
            {
              id: 'published',
              weight: 1,
              narrative:
                '程序被杂志采用，你的作品换来了大约五百美元。\n\n你把那张纸看了又看。真正改变你的不是金额，而是一个突然成立的等式：脑海里的东西，可以变成别人愿意付钱的东西。',
              effects: [
                { stat: 'wealth', delta: 500 },
                { stat: 'business', delta: 8 },
              ],
              addTags: ['blastar_sold'],
              year: 1989,
            },
          ],
        },
        {
          id: 'refine',
          text: '留下代码，再做一个更大的世界。',
          hint: '这一次，完成作品比卖出作品更重要。',
          affinity: { engineeringDrive: 1 },
          outcomes: [
            {
              id: 'private',
              weight: 1,
              narrative:
                '信封没有封口。你又增加了一关，然后推翻了碰撞逻辑。\n\n这款游戏没有登上那本杂志。但许多年后，你仍会记得：第一次完整地创造一个世界是什么感觉。',
              effects: [{ stat: 'technical', delta: 12 }],
              year: 1989,
              deviation: 8,
            },
          ],
        },
      ],
    }),
    defineEvent({
      id: 'canada',
      title: '海的另一边',
      chapter: '第二章 · 向北',
      truthType: 'CANON_DRAMATIZED',
      historicalConfidence: 'medium',
      sourceRefs: ['queens-2013'],
      historicalNote:
        '赴加拿大与家庭背景有资料支持。机场场景、盘缠分配和内心独白均为艺术加工；1989 年作为阶段时间锚点。',
      conditions: [
        { tag: 'computer' },
        { field: 'year', gte: 1989, lte: 1989 },
      ],
      priority: 100,
      storyRole: 'anchor',
      category: 'career',
      scene: {
        location: '加拿大 · 初来乍到',
        year: 1989,
        timeOfDay: '清晨',
        backgroundKey: 'university_campus',
        atmosphere: '离开熟悉的地方，并不会自动抵达未来。',
        openingNarrative:
          '箱子比你想象中轻。真正要带走的东西，大多没有重量。\n\n加拿大的空气和记忆里的南非不同。你已经离开，但科技公司、大学、那些能改变世界的人，仍然远得像杂志上的地址。\n\n现在必须先解决更小的问题：住在哪里，下个月的钱从哪里来。你把地图折起来，又展开。北美如此宽阔，没有一个位置会自动写上你的名字。',
      },
      choices: [
        {
          id: 'work',
          text: '先找工作，把下一步的盘缠攒出来。',
          hint: '身体会疲惫，计划会更踏实。',
          affinity: { engineeringDrive: 1 },
          outcomes: [
            {
              id: 'earned',
              weight: 1,
              narrative:
                '日子缩成了工作、睡觉和计算余额。疲惫不会让未来更近，却让你有了继续走的办法。\n\n你终于把大学申请放到桌面中央。',
              effects: [
                { stat: 'wealth', delta: 1500 },
                { stat: 'energy', delta: -12 },
              ],
              addTags: ['canada'],
              country: '加拿大',
              city: '金斯顿',
              year: 1990,
            },
          ],
        },
        {
          id: 'connections',
          text: '主动联系亲友，问出通往大学的路。',
          hint: '承认需要帮助，也是一种行动。',
          affinity: { curiosity: 1 },
          outcomes: [
            {
              id: 'helped',
              weight: 1,
              narrative:
                '有些电话无人接听，有些人愿意多聊几分钟。你把名字和建议抄在纸背，原本抽象的北美，渐渐变成一个个可以敲开的门。',
              effects: [
                { stat: 'network', delta: 12 },
                { stat: 'wealth', delta: 800 },
              ],
              addTags: ['canada', 'networking'],
              country: '加拿大',
              city: '金斯顿',
              year: 1990,
            },
          ],
        },
      ],
    }),
    defineEvent({
      id: 'queens',
      title: '聪明的人，坐在另一边',
      chapter: '第二章 · 向北',
      truthType: 'CANON_DRAMATIZED',
      historicalConfidence: 'disputed',
      sourceRefs: ['queens-2013'],
      conditions: [{ tag: 'canada' }, { field: 'year', gte: 1990, lte: 1991 }],
      priority: 100,
      storyRole: 'anchor',
      category: 'relationship',
      scene: {
        location: '加拿大 · Queen’s 大学',
        year: 1990,
        timeOfDay: '深夜',
        backgroundKey: 'university_campus',
        atmosphere: '有些问题，无法独自解完。',
        openingNarrative:
          '宿舍公共区的灯还亮着。你在纸上解释一个想法，对面的同学却没有顺着你的推导点头。\n\n他问：如果你的起点就是错的呢？\n\n你想立刻反驳，又意识到他可能真的找到了漏洞。窗外的湖面一片漆黑。第一次，争论没有像学校里的冲突那样结束；另一个人留下来，等你重新想一遍。',
      },
      choices: [
        {
          id: 'debate',
          text: '把起点拆掉，和他一起重新推导。',
          hint: '一个更好的答案，可能需要两个人。',
          affinity: { curiosity: 1 },
          outcomes: [
            {
              id: 'collaborate',
              weight: 1,
              narrative:
                '纸越写越乱，问题却越来越清楚。你没有赢下整场争论，但你们一起找到了新的解法。\n\n后来，你开始认真考虑另一所大学：在那里，物理和商业可以放进同一个人生。',
              effects: [
                { stat: 'network', delta: 10 },
                { stat: 'technical', delta: 8 },
              ],
              addTags: ['queens'],
              year: 1992,
            },
          ],
        },
        {
          id: 'solo',
          text: '把疑问记下来，独自做出一个能证明的原型。',
          hint: '让可以运行的东西回应质疑。',
          affinity: { engineeringDrive: 1, autonomy: 1 },
          outcomes: [
            {
              id: 'prototype',
              weight: 1,
              narrative:
                '你错过了几场聚会，却写出了一段可以反复运行的代码。它证明了你的部分直觉，也毫不留情地指出了另一部分错误。\n\n机器不在乎谁赢了争论。这个特点令你安心。',
              effects: [
                { stat: 'technical', delta: 14 },
                { stat: 'stress', delta: 5 },
              ],
              addTags: ['queens'],
              year: 1992,
            },
          ],
        },
      ],
    }),
    defineEvent({
      id: 'penn',
      title: '两种语言，一张地图',
      chapter: '第三章 · 未来的形状',
      truthType: 'CANON_DRAMATIZED',
      historicalConfidence: 'high',
      sourceRefs: ['wharton-2009'],
      conditions: [{ tag: 'queens' }, { field: 'year', gte: 1992, lte: 1994 }],
      priority: 100,
      storyRole: 'anchor',
      category: 'career',
      scene: {
        location: '美国 · 宾夕法尼亚大学',
        year: 1992,
        timeOfDay: '傍晚',
        backgroundKey: 'university_campus',
        atmosphere: '物理解释世界如何运行，商业解释世界为何停在原处。',
        openingNarrative:
          '上午，你在物理课上计算能量。下午，另一间教室把同一个世界写成成本与收益。\n\n两种语言似乎彼此陌生，你却开始在它们之间画线。太阳能、互联网、太空——真正有意思的问题，往往大到不像一份工作。\n\n可桌上还有没有完成的作业，还有一台能写游戏的电脑。你不可能同时把所有门都推开。',
      },
      choices: [
        {
          id: 'internet',
          text: '研究互联网。连接本身，也许就是机会。',
          hint: '靠近正在发生的技术浪潮。',
          affinity: { curiosity: 1, ambition: 1 },
          outcomes: [
            {
              id: 'web',
              weight: 1,
              narrative:
                '你发现许多现实里的交易，还停留在纸张和电话里。技术能跨过的距离，比商业已经跨过的距离远得多。\n\n等你来到加州时，那个间隙已经像一扇即将关上的门。',
              effects: [
                { stat: 'business', delta: 15 },
                { stat: 'technical', delta: 8 },
              ],
              addTags: ['penn'],
              country: '美国',
              city: '帕洛阿尔托',
              year: 1995,
            },
          ],
        },
        {
          id: 'games',
          text: '把课余时间押在游戏上，创造一个可以进入的宇宙。',
          hint: '多年以前的飞船，还没有飞到尽头。',
          affinity: { engineeringDrive: 1, curiosity: 1 },
          outcomes: [
            {
              id: 'demo',
              weight: 1,
              narrative:
                '你把物理作业里的运动模型放进游戏。一个小小的世界有了自己的规律。\n\n有人说，它值得带去加州试试。你把演示程序和申请材料装进同一个箱子。',
              effects: [{ stat: 'technical', delta: 15 }],
              addTags: ['penn', 'game_experience'],
              country: '美国',
              city: '帕洛阿尔托',
              year: 1995,
              deviation: 5,
            },
          ],
        },
      ],
    }),
  ],
};
