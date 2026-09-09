import type { ContentPack, LifeEvent } from '../../game/types';
// 共同的舞台信息不包含剧情逻辑；各事件仅通过条件进入候选池。
const office = {
  location: '美国 · 帕洛阿尔托',
  year: 1995,
  timeOfDay: '灯火未熄',
  backgroundKey: 'office_1990s',
  atmosphere: '有些未来，只隔着一次决定。',
};
const alt = {
  truthType: 'ALTERNATE' as const,
  historicalConfidence: 'alternate' as const,
};
const canon = {
  truthType: 'CANON_DRAMATIZED' as const,
  historicalConfidence: 'medium' as const,
};
const major = {
  chapter: '第四章 · 没有地图的地方',
  priority: 80,
  storyRole: 'major' as const,
  category: 'career',
};
const events: LifeEvent[] = [
  {
    ...canon,
    ...major,
    id: 'stanford',
    title: '门开着，时间却不等人',
    storyRole: 'anchor',
    sourceRefs: ['stanford-2015'],
    conditions: [{ tag: 'penn' }, { field: 'year', gte: 1995, lte: 1995 }],
    scene: {
      ...office,
      backgroundKey: 'university_campus',
      openingNarrative:
        '斯坦福的博士计划摆在面前，它许诺的是一条清晰的路：研究、论文，以及许多年后才知道答案的问题。\n\n而校园外，互联网正在改变速度的含义。等你写完一篇论文，某些机会可能已经成为别人的公司。\n\n你和 Kimbal 谈起地图、商户和一座可以被搜索的城市。他很兴奋。可你们既没有成熟的产品，也不知道谁会付钱。\n\n你也可以先走进一家真正的技术公司。或者，把箱子里的那款游戏拿出来。',
    },
    choices: [
      {
        id: 'startup',
        text: '把博士计划暂时放下，和 Kimbal 做一家互联网公司。',
        hint: '没有现成的位置，就试着创造一个。',
        affinity: { autonomy: 1, ambition: 1 },
        outcomes: [
          {
            id: 'begin',
            weight: 1,
            narrative:
              '你合上学校的材料，把城市地图铺在桌面。Kimbal 坐到对面。\n\n没有掌声，也没有天降的信心。你们先算房租，再算一台电脑多少钱。未来忽然具体得令人不安。',
            addTags: ['startup_intent'],
            career: '创业者',
            company: '',
            effects: [{ stat: 'stress', delta: 8 }],
          },
        ],
      },
      {
        id: 'netscape',
        text: '去 Netscape 试试。先到浪潮的中心。',
        hint: '技术能够敲门，门后却未必有人回应。',
        affinity: { engineeringDrive: 1 },
        outcomes: [
          {
            id: 'apply',
            weight: 1,
            narrative:
              '你重新整理了自己的经历，反复检查邮件里的措辞。发送键很小，按下去却像跨过一条线。\n\n现在，有一部分未来掌握在某个还不知道你名字的人手里。',
            addTags: ['netscape_intent'],
            deviation: 12,
          },
        ],
      },
      {
        id: 'games',
        text: '带着演示程序去找游戏公司。',
        hint: '让别人进入你创造的宇宙。',
        requirements: [{ tag: 'game_experience' }],
        affinity: { curiosity: 1, autonomy: 1 },
        outcomes: [
          {
            id: 'indie',
            weight: 1,
            narrative:
              '你给几家公司写信，介绍一个还没有名字的项目。这一次，你不是求一个职位，而是想让某个陌生人相信：这个世界值得被做出来。',
            addTags: ['game_intent'],
            career: '独立游戏开发者',
            deviation: 35,
          },
        ],
      },
      {
        id: 'research',
        text: '留下来研究能源。值得做的问题，不必立刻成为公司。',
        hint: '一条更慢的路，也有未知的边界。',
        affinity: { curiosity: 1, engineeringDrive: 1 },
        outcomes: [
          {
            id: 'scholar',
            weight: 1,
            narrative:
              '几年后，实验室的灯仍亮着。你学会和漫长的失败相处，也学会在论文之外寻找让成果落地的办法。\n\n现实中的另一个你，此时正在经历互联网公司的狂热。而你打开实验记录，给一个新的方案写下第一行。',
            addTags: ['end_research'],
            career: '能源研究者',
            company: '大学实验室',
            year: 1999,
            deviation: 65,
            effects: [{ stat: 'technical', delta: 20 }],
          },
        ],
      },
    ],
  },
  {
    ...alt,
    ...major,
    id: 'netscape',
    title: '等待一封回信',
    conditions: [
      { tag: 'netscape_intent' },
      { field: 'year', gte: 1995, lte: 1996 },
    ],
    scene: {
      ...office,
      openingNarrative:
        '你坐在 Netscape 附近的小店里，咖啡早已凉透。\n\n对方没有答应面试，也没有明确拒绝。你可以继续等，可等待并不是你擅长的工作。笔记本里写着几个浏览器性能问题；它们比自我介绍更令你兴奋。\n\n如果有人愿意看一眼，也许事情会不同。如果没有，你又准备把多少时间交给这封不来的回信？',
    },
    choices: [
      {
        id: 'persist',
        text: '补上一份技术方案，再争取一次面试。',
        hint: '你的技术和人脉会影响这扇门是否打开。',
        affinity: { engineeringDrive: 1, ambition: 1 },
        outcomes: [
          {
            id: 'hired',
            weight: 35,
            modifiers: [
              { field: 'technical', factor: 0.3 },
              { field: 'network', factor: 0.35 },
            ],
            narrative:
              '面试官把你的纸转向自己，问了一个真正的技术问题。几个小时后，你走出大楼，口袋里多了一张联系人名片。\n\n几天后，录用邮件到了。你成了 Netscape 的工程师——这条人生，已经离开现实中的轨迹。',
            addTags: ['employed'],
            removeTags: ['netscape_intent'],
            career: '软件工程师',
            company: 'Netscape',
            year: 1996,
            deviation: 20,
            effects: [{ stat: 'income', delta: 60000 }],
          },
          {
            id: 'rejected',
            weight: 55,
            narrative:
              '回信很客气，也很短。没有你可以继续讨论的技术问题，只有一句没有位置。\n\n你在停车场坐了一会儿，拨通 Kimbal 的电话。既然这扇门没有打开，也许该给自己的房间安一扇门。',
            addTags: ['startup_intent', 'netscape_rejected'],
            removeTags: ['netscape_intent'],
            effects: [{ stat: 'stress', delta: 8 }],
          },
          {
            id: 'referral',
            weight: 10,
            narrative:
              'Netscape 没有给你职位，面试官却把你介绍给另一家软件公司。\n\n它没有站在报纸头版，但提供一份真正的合同。你答应先去看看。未来拐了一个没有标在地图上的弯。',
            addTags: ['employed'],
            removeTags: ['netscape_intent'],
            career: '软件工程师',
            company: '湾区软件公司',
            year: 1996,
            deviation: 25,
            effects: [{ stat: 'income', delta: 48000 }],
          },
        ],
      },
      {
        id: 'leave',
        text: '不等了。给 Kimbal 打电话。',
        hint: '带着新的认识，回到自己的创业计划。',
        affinity: { autonomy: 1 },
        outcomes: [
          {
            id: 'own_door',
            weight: 1,
            narrative:
              '你离开时，咖啡还剩大半杯。Kimbal 接起电话，先问你面试怎么样。\n\n你说，先不谈那个。我们来谈谈地图。',
            addTags: ['startup_intent', 'netscape_rejected'],
            removeTags: ['netscape_intent'],
            deviation: -5,
          },
        ],
      },
    ],
  },
  {
    ...alt,
    ...major,
    id: 'engineer',
    once: false,
    cooldown: 2,
    title: '别人的路线图',
    conditions: [{ tag: 'employed' }, { field: 'year', gte: 1996, lte: 1998 }],
    scene: {
      ...office,
      year: 1996,
      openingNarrative:
        '工牌让门自动打开。工资准时到账。第一次，你不必一边写代码，一边计算还能付几个月房租。\n\n但你提出的重构方案被挪到了下一个季度。理由是，现有产品已经足够好。\n\n足够好。你盯着这几个字，觉得它们像一把从外面拧上的锁。是你太着急了，还是这间屋子真的太小？',
      variants: [
        {
          when: [{ tag: 'startup_failed' }],
          text: '你还记得上一次创业结束时，空掉的账户是什么样子。现在的安稳不是幻觉；失去它的风险也不是。',
        },
      ],
    },
    choices: [
      {
        id: 'resign',
        text: '离开公司。我要自己决定该解决什么。',
        hint: '放弃薪水，带着工程经验重新创业。',
        affinity: { autonomy: 1, ambition: 1 },
        outcomes: [
          {
            id: 'founder',
            weight: 1,
            narrative:
              '离职信只有几行，你却检查了很久。走出大楼时，你没有工牌，也没有新的保证。\n\n你和 Kimbal 再次讨论起本地商户与在线地图。路绕远了一些，方向却重新靠近了现实中的那次创业。',
            addTags: ['startup_intent', 'rejoined'],
            removeTags: ['employed'],
            company: '',
            career: '创业者',
            deviation: -15,
            effects: [{ stat: 'technical', delta: 10 }],
          },
        ],
      },
      {
        id: 'stay',
        text: '留下来，先把手头的产品做好。',
        hint: '稳定会带来积累，自主需求也会继续增长。',
        autonomyCost: 27,
        affinity: { stabilityNeed: 1, engineeringDrive: 0.3 },
        outcomes: [
          {
            id: 'settled',
            weight: 1,
            narrative:
              '你删掉了离职信，开始修复别人一直绕开的漏洞。产品更好了，账户余额也更好看。\n\n但每次规划会结束，你都会留在空会议室里，看一会儿白板上被擦掉的方案。',
            addTags: ['stayed'],
            year: 1997,
            effects: [
              { stat: 'wealth', delta: 22000 },
              { stat: 'technical', delta: 8 },
              { stat: 'energy', delta: 8 },
            ],
            deviation: 10,
          },
        ],
      },
    ],
  },
  {
    ...alt,
    ...major,
    id: 'stable',
    once: false,
    cooldown: 2,
    title: '一切都在变好，除了那个问题',
    category: 'reflection',
    conditions: [
      { tag: 'stayed' },
      { tag: 'employed' },
      { field: 'year', gte: 1997, lte: 1998 },
    ],
    scene: {
      ...office,
      year: 1997,
      openingNarrative:
        '经理给了你一次加薪。你搬到更亮的公寓，冰箱里不再只放着便宜的速食。\n\n朋友说，事情终于走上正轨了。你点头。\n\n晚上，一份新的架构方案又占满桌面。没有人要求你做它；公司也不会批准它。你明明可以关灯，却忍不住继续计算。\n\n稳定确实解决了一些问题。它没有解决你想亲手定义问题的欲望。',
    },
    choices: [
      {
        id: 'stay_again',
        text: '再留一年。我可以学会和不完美共处。',
        hint: '这不是禁选项，但压下去的念头会回来。',
        autonomyCost: 30,
        affinity: { stabilityNeed: 1 },
        outcomes: [
          {
            id: 'pressure',
            weight: 1,
            narrative:
              '你接受了晋升。白天，你成了别人信赖的同事；夜里，那份未获批准的方案却越来越长。\n\n忍耐没有让想法消失。它只是给想法攒够了燃料。',
            addTags: ['stable_year'],
            year: 1998,
            effects: [
              { stat: 'wealth', delta: 30000 },
              { stat: 'reputation', delta: 10 },
            ],
            deviation: 8,
          },
        ],
      },
      {
        id: 'spinout',
        text: '先争取一个内部团队，让想法接受真实检验。',
        hint: '试着在组织内找到自主权。',
        affinity: { autonomy: 1, engineeringDrive: 1 },
        outcomes: [
          {
            id: 'approved',
            weight: 45,
            modifiers: [{ field: 'reputation', factor: 0.3 }],
            narrative:
              '管理层给了你一个小团队和明确的期限。你接受了边界，因为这一次，边界里终于有一件你自己选的问题。\n\n你没有变成另一种人，只是找到了一种暂时容得下自己的组织方式。',
            addTags: ['end_engineer'],
            career: '技术团队负责人',
            year: 1999,
            effects: [
              { stat: 'autonomyConflict', delta: -25 },
              { stat: 'influence', delta: 15 },
            ],
          },
          {
            id: 'denied',
            weight: 55,
            narrative:
              '方案再次被拒绝。你把文件整齐地收进包里，没有像从前那样争论。\n\n回家的路上，你第一次认真计算：如果自己组建团队，要多少钱？',
            addTags: ['stable_year'],
            year: 1998,
            effects: [{ stat: 'autonomyConflict', delta: 45 }],
          },
        ],
      },
    ],
  },
  {
    ...alt,
    ...major,
    id: 'gravity',
    once: false,
    cooldown: 2,
    title: '没有人让你继续忍耐',
    priority: 115,
    category: 'reflection',
    conditions: [
      { tag: 'stable_year' },
      { tag: 'employed' },
      { field: 'autonomyConflict', gte: 35 },
      { field: 'year', gte: 1997, lte: 1999 },
    ],
    scene: {
      ...office,
      year: 1998,
      openingNarrative:
        '凌晨两点，办公室只剩你这一盏灯。屏幕上是你私下做的原型。它还很粗糙，却比过去一年任何一次绩效评价更让你清醒。\n\nKimbal 的邮件只有几句话：我还在想那个城市指南。你呢？\n\n你看向窗外。多留一年是你的决定，再多留一年也可以是。没有什么神秘力量会替你离职。只是你已经知道，继续留下，需要承担哪一种代价。',
    },
    choices: [
      {
        id: 'return',
        text: '把原型带出去。这次，我要建立自己的团队。',
        hint: '人格冲突变成行动，再次汇入创业路线。',
        affinity: { autonomy: 1, ambition: 1 },
        outcomes: [
          {
            id: 'return_startup',
            weight: 1,
            narrative:
              '你回复了邮件。第二天，你去找经理。\n\n这一次的出发没有年轻时那么轻快。你知道失败会怎样，也知道自己为什么仍要动身。等待多年之后，那张地图终于重新摊开。',
            addTags: ['startup_intent', 'rejoined'],
            removeTags: ['employed', 'stable_year'],
            company: '',
            career: '创业者',
            deviation: -15,
            effects: [{ stat: 'autonomyConflict', delta: -35 }],
          },
        ],
      },
      {
        id: 'boundaries',
        text: '留下，但给自己的研究留一块不受干涉的地方。',
        hint: '接受收入与自主之间长期存在的张力。',
        autonomyCost: 15,
        affinity: { stabilityNeed: 1, engineeringDrive: 0.5 },
        outcomes: [
          {
            id: 'different_balance',
            weight: 1,
            narrative:
              '你和公司重新谈了职责，也为工作以外的项目划出时间。不是每一项要求都被接受，但你终于不再假装自己只想安稳。\n\n有些晚上仍然焦躁，有些清晨却很满足。你没有创办那家改变历史的公司，你仍然在创造东西。',
            addTags: ['end_engineer'],
            year: 1999,
            deviation: 10,
          },
        ],
      },
    ],
  },
  {
    ...canon,
    ...major,
    id: 'zip2',
    title: '把一座城市装进电脑',
    once: false,
    cooldown: 1,
    storyRole: 'anchor',
    sourceRefs: ['stanford-2003', 'wharton-2009'],
    conditions: [
      { tag: 'startup_intent' },
      { field: 'year', gte: 1995, lte: 1998 },
    ],
    scene: {
      ...office,
      openingNarrative:
        '办公室很小。地图铺开之后，Kimbal 只能把文件放在膝上。\n\n商户地址、路线、营业时间——这些东西散在电话簿里，而你想让它们出现在同一个屏幕上。技术上并非不可能，真正困难的是说服别人：顾客终有一天会先打开电脑。\n\n钱只能撑一阵子。你们必须决定先把哪一部分做出来，再走出去敲门。',
      variants: [
        {
          when: [{ tag: 'netscape_rejected' }],
          text: '你想起那封没能带来工作的邮件。现在，至少有没有下一步，由你们自己决定。',
        },
        {
          when: [{ tag: 'rejoined' }],
          text: '这次创业发生在你的绕行之后。它与现实历史重新接近，却不会抹掉你已经走过的其他道路。',
        },
      ],
    },
    choices: [
      {
        id: 'prototype',
        text: '先做出能运行的地图，让产品替我们说话。',
        hint: '技术准备更充分，现金压力会更大。',
        affinity: { engineeringDrive: 1 },
        outcomes: [
          {
            id: 'built',
            weight: 1,
            narrative:
              '第一条路线终于出现在屏幕上。你们检查了好几遍，确认它真的指向街角的那家店。\n\n你很想继续把它做得更好。Kimbal 已经拿起了电话：现在，该有人看见它了。',
            addTags: ['zip2_started'],
            removeTags: ['startup_intent'],
            company: 'Zip2',
            career: '创业者',
            effects: [
              { stat: 'technical', delta: 10 },
              { stat: 'stress', delta: 10 },
            ],
            year: 1996,
          },
        ],
      },
      {
        id: 'customers',
        text: '先去问商户。做出没人需要的东西也算失败。',
        hint: '客户反馈能改变计划，也会刺痛自信。',
        affinity: { curiosity: 1, ambition: 1 },
        outcomes: [
          {
            id: 'listened',
            weight: 1,
            narrative:
              '有些店主很快结束了谈话，另一些人问：它能带来多少顾客？\n\n你们带回一叠新的问题。代码还没有变多，产品却第一次开始接近房间外面的世界。',
            addTags: ['zip2_started'],
            removeTags: ['startup_intent'],
            company: 'Zip2',
            career: '创业者',
            effects: [
              { stat: 'business', delta: 16 },
              { stat: 'network', delta: 8 },
            ],
            year: 1996,
          },
        ],
      },
    ],
  },
  {
    ...canon,
    ...major,
    id: 'pitch',
    once: false,
    cooldown: 1,
    title: '关掉投影之后',
    sourceRefs: ['stanford-2003'],
    conditions: [
      { tag: 'zip2_started' },
      { field: 'year', gte: 1996, lte: 1998 },
    ],
    scene: {
      ...office,
      year: 1996,
      openingNarrative:
        '演示结束了。对方没有立刻说话，你听见电脑风扇一直在转。\n\n最后，一个人问：为什么我们不继续使用电话簿？\n\n你知道技术的答案，可他要的是生意的答案。Kimbal 在桌下轻轻碰了一下你的鞋。这里不是一道只要算对就会给分的题。\n\n你可以再赌一次，也可以先承认，这个计划需要一个更慢的起点。',
    },
    choices: [
      {
        id: 'bet',
        text: '继续争取。把所有证据摆上桌。',
        hint: '技术、商业判断与人脉共同影响融资结果。',
        affinity: { ambition: 1, riskTolerance: 1 },
        outcomes: [
          {
            id: 'funded',
            weight: 55,
            modifiers: [
              { field: 'business', factor: 0.4 },
              { field: 'technical', factor: 0.2 },
              { field: 'network', factor: 0.2 },
            ],
            narrative:
              '对方把椅子向前挪了一点。问题从“为什么”变成了“什么时候”。\n\n合同不是奇迹。它带来资金，也带来新的要求、期限和不再由你独自决定的事情。但今晚，你们可以先把电脑继续开着。',
            addTags: ['zip2_funded'],
            year: 1999,
            effects: [
              { stat: 'business', delta: 12 },
              { stat: 'wealth', delta: 50000 },
            ],
          },
          {
            id: 'failed',
            weight: 45,
            conditions: [{ tag: 'startup_failed', absent: true }],
            narrative:
              '会谈结束，没有签字。你们又试了几次，账户却比说服别人的速度更快见底。\n\n最后，你关掉那台电脑，找了一份软件工作。你仍会写代码，只是这一次，房租不能再等一个宏大的理由。',
            addTags: ['startup_failed', 'employed'],
            removeTags: ['zip2_started'],
            year: 1996,
            career: '软件工程师',
            company: '湾区软件公司',
            deviation: 35,
            effects: [
              { stat: 'wealth', delta: -1500 },
              { stat: 'stress', delta: 18 },
              { stat: 'income', delta: 48000 },
            ],
          },
          {
            id: 'second_attempt_small',
            weight: 45,
            conditions: [{ tag: 'startup_failed' }],
            narrative:
              '投资人仍然没有点头。这次你没有把团队拖到现金耗尽：你把产品缩成可以立即收费的服务。\n\n公司比最初想象的小，却活了下来。你带回来的经验，终于改变了失败的形状。',
            addTags: ['end_independent'],
            year: 1999,
            deviation: 10,
            effects: [{ stat: 'wealth', delta: 40000 }],
          },
        ],
      },
      {
        id: 'bootstrap',
        text: '缩小产品，先靠真实客户的收入活下去。',
        hint: '保住自主权，也接受增长更慢的结果。',
        affinity: { autonomy: 1, engineeringDrive: 1 },
        outcomes: [
          {
            id: 'small_company',
            weight: 1,
            narrative:
              '你们收起过于宏大的演示，从最小的服务开始收费。一些计划被推迟，另一些终于被客户真正用上。\n\n几年后，公司没有出现在巨额并购的头条。它却能付工资、养活团队，并继续做出你认为应该存在的东西。',
            addTags: ['end_independent'],
            year: 1999,
            deviation: 20,
            effects: [
              { stat: 'wealth', delta: 90000 },
              { stat: 'influence', delta: 20 },
            ],
          },
        ],
      },
    ],
  },
  {
    ...alt,
    ...major,
    id: 'games',
    title: '只有一个玩家的宇宙',
    conditions: [
      { tag: 'game_intent' },
      { field: 'year', gte: 1995, lte: 1998 },
    ],
    scene: {
      ...office,
      openingNarrative:
        '游戏里的飞船已经会计算轨道，试玩者却在第一分钟就迷了路。\n\n你解释了半天。他说，很厉害。然后把鼠标放下了。\n\n这比程序崩溃更难处理。物理是对的，体验却没有成立。你想创造宇宙，但宇宙必须给别人一个愿意留下的理由。\n\n发行商只答应看一个短演示。剩下的时间不够重做所有东西。',
    },
    choices: [
      {
        id: 'simplify',
        text: '删掉一半系统，把第一次飞行做好。',
        hint: '承认复杂不等于有趣。',
        affinity: { engineeringDrive: 1 },
        outcomes: [
          {
            id: 'playable',
            weight: 1,
            narrative:
              '你删掉了几段最骄傲的代码。演示变短了，玩家却第一次问：后面还有吗？\n\n那句话让你坐直了。也许你要解决的问题，从来不只是怎样模拟宇宙。',
            addTags: ['game_demo'],
            effects: [{ stat: 'business', delta: 10 }],
            year: 1996,
          },
        ],
      },
      {
        id: 'ambitious',
        text: '保留核心模拟，再赌一次技术突破。',
        hint: '野心可能打动人，也可能耗尽耐心。',
        affinity: { ambition: 1, engineeringDrive: 1 },
        outcomes: [
          {
            id: 'deep_demo',
            weight: 1,
            narrative:
              '你又熬了几夜，做出一段令人屏息的轨道演示。它仍然难懂，却确实与市场上已有的东西不同。\n\n发行商来了。现在，你需要证明这种不同值得付钱。',
            addTags: ['game_demo'],
            effects: [
              { stat: 'technical', delta: 10 },
              { stat: 'stress', delta: 12 },
            ],
            year: 1996,
          },
        ],
      },
    ],
  },
  {
    ...alt,
    ...major,
    id: 'publisher',
    title: '名字印在盒子上',
    conditions: [{ tag: 'game_demo' }, { field: 'year', gte: 1996, lte: 1999 }],
    scene: {
      ...office,
      year: 1996,
      openingNarrative:
        '发行商把两种可能放在桌上。一种是加入他们的团队，得到薪水、设备和制作资源。另一种是继续独立，为发行合同争取保留创作权。\n\n你看着演示程序。许多年前，那艘小飞船只能在自己房间里飞。如今，有人愿意把一个更大的世界装进盒子，寄到陌生人的家里。\n\n代价是，这个宇宙可能不再完全由你决定。',
    },
    choices: [
      {
        id: 'studio',
        text: '加入游戏公司，把它真正做完。',
        hint: '用部分自主权，换取更大的制作能力。',
        autonomyCost: 15,
        affinity: { engineeringDrive: 1 },
        outcomes: [
          {
            id: 'shipped',
            weight: 1,
            narrative:
              '几年后，你第一次在商店里看见那个盒子。署名不是你一个人的，宇宙也不再完全按你的想法运行。\n\n有玩家在信里挑毛病，有人用你从未想到的方式玩它。你把信带回办公室，迫不及待想做下一个版本。',
            addTags: ['end_games'],
            year: 1999,
            career: '游戏技术总监',
            company: '独立游戏工作室',
            deviation: 15,
            effects: [
              { stat: 'wealth', delta: 80000 },
              { stat: 'reputation', delta: 30 },
            ],
          },
        ],
      },
      {
        id: 'independent',
        text: '争取独立发行。我还想决定这个世界的边界。',
        hint: '商业准备会影响发行商是否愿意冒险。',
        affinity: { autonomy: 1, riskTolerance: 1 },
        outcomes: [
          {
            id: 'deal',
            weight: 45,
            modifiers: [{ field: 'business', factor: 0.5 }],
            narrative:
              '合同来回修改了好几次，你终于保留了最看重的部分。\n\n发布那天，服务器并不繁忙。但第一封陌生玩家的邮件来了。他讲述了自己在游戏里做的一件小事。那个宇宙，从此不再只有你一个人。',
            addTags: ['end_games'],
            year: 1999,
            company: '自己的游戏工作室',
            deviation: 20,
            effects: [{ stat: 'wealth', delta: 120000 }],
          },
          {
            id: 'no_deal',
            weight: 55,
            narrative:
              '发行商退出了。你没有突然改变对作品的看法，只是终于承认，现在必须先活下去。\n\n你把游戏备份好，接受了一份软件工程师的工作。那些未完成的世界，被你带进了另一间办公室。',
            addTags: ['employed', 'startup_failed'],
            removeTags: ['game_intent'],
            career: '软件工程师',
            company: '湾区软件公司',
            year: 1997,
            deviation: 10,
            effects: [
              { stat: 'stress', delta: 10 },
              { stat: 'income', delta: 48000 },
            ],
          },
        ],
      },
    ],
  },
  {
    ...canon,
    ...major,
    id: 'exit',
    title: '所有门都打开的那一天',
    sourceRefs: ['wharton-2009'],
    conditions: [
      { tag: 'zip2_funded' },
      { field: 'year', gte: 1999, lte: 1999 },
    ],
    scene: {
      ...office,
      year: 1999,
      openingNarrative:
        '收购文件签完之后，房间里反而很安静。\n\n现实历史中，Compaq 在这一年收购了 Zip2。对于你的这条人生，今天同样意味着一件陌生的事：钱第一次不再是每个问题的开头。\n\n你可以休息，买一间更好的房子，让生活慢下来。也可以重新打开那本已经写满的笔记。里面还有银行、能源，还有遥远得不合时宜的太空。\n\n一扇门关上了。你发现自己仍在寻找下一扇。',
    },
    choices: [
      {
        id: 'next',
        text: '翻开新的笔记。下一个问题是什么？',
        hint: '这段故事结束，人生仍在向前。',
        affinity: { ambition: 1, curiosity: 1 },
        outcomes: [
          {
            id: 'new_page',
            weight: 1,
            narrative:
              '你写下“钱为什么不能像信息一样流动”。然后，在另一页角落画了一枚很小的火箭。\n\n这还不是计划。它们只是那些一旦出现，就很难被你放下的问题。',
            addTags: ['end_founder'],
            effects: [
              { stat: 'wealth', delta: 22000000 },
              { stat: 'influence', delta: 30 },
            ],
          },
        ],
      },
      {
        id: 'rest',
        text: '先停下来，看看一路上错过了什么。',
        hint: '停顿也是选择，不意味着野心消失。',
        autonomyCost: 6,
        affinity: { stabilityNeed: 0.5, curiosity: 1 },
        outcomes: [
          {
            id: 'pause',
            weight: 1,
            narrative:
              '你把笔记本合上。这一次，没人催你赶上哪个期限。\n\n有一天，你在散步时又想起一个老问题。你没有立刻跑回电脑前，只是慢慢记住了它。未来仍然有时间。',
            addTags: ['end_founder'],
            deviation: 5,
            effects: [
              { stat: 'wealth', delta: 22000000 },
              { stat: 'energy', delta: 30 },
              { stat: 'stress', delta: -25 },
            ],
          },
        ],
      },
    ],
  },
];
export const siliconValley: ContentPack = {
  id: 'silicon-valley',
  version: '1.0.0',
  requires: ['early-life'],
  events,
  tags: [
    'startup_intent',
    'netscape_intent',
    'game_intent',
    'employed',
    'netscape_rejected',
    'rejoined',
    'stayed',
    'stable_year',
    'zip2_started',
    'zip2_funded',
    'startup_failed',
    'game_demo',
    'end_research',
    'end_engineer',
    'end_games',
    'end_founder',
    'end_independent',
  ],
  endings: [
    {
      id: 'founder',
      title: '下一扇门',
      subtitle: 'THE NEXT HORIZON',
      conditions: [{ tag: 'end_founder' }],
      narrative:
        '1999 年。你终于不必再把办公室当成整个世界。\n\n回头看时，那些选择并不像一条必然通向这里的路。一次回信、一个签字、某个没有睡着的晚上，都曾让它偏向别处。\n\n财富给了你更多可能，却没有替你回答：接下来，究竟什么值得用一生去做？\n\n你翻开空白的一页。故事暂时停在这里。',
    },
    {
      id: 'games',
      title: '另一种宇宙',
      subtitle: 'WORLDS WITHIN WORLDS',
      conditions: [{ tag: 'end_games' }],
      narrative:
        '你没有把飞船送进现实的轨道。你让它飞进了许多人的房间。\n\n有人在深夜打开你的游戏，第一次对物理产生兴趣；也有人只是玩得很开心。世界没有因此变成另一颗星球，但它多了一些原本不存在的体验。\n\n在这个平行人生里，你用另一种方式，延续了童年屏幕上的那一点光。',
    },
    {
      id: 'engineer',
      title: '安稳中的引力',
      subtitle: 'A DIFFERENT EQUILIBRIUM',
      conditions: [{ tag: 'end_engineer' }],
      narrative:
        '你的名字没有出现在创业传奇的标题里。你的代码却每天被很多人使用。\n\n你学会了协作，也始终没有彻底习惯妥协。有些遗憾留了下来，有些问题被你真正解决。\n\n安稳不是没有代价的奖品，冒险也不是唯一值得讲述的人生。你保留了创造东西的能力，以及下一次改变方向的可能。',
    },
    {
      id: 'research',
      title: '慢一点的光',
      subtitle: 'THE PATIENT QUESTION',
      conditions: [{ tag: 'end_research' }],
      narrative:
        '论文不会像公司估值那样陡峭地上升。它需要你反复承认，昨天的解释还不够好。\n\n你留在研究里，试着让能源问题从理论走向现实。这个世界没有自动给你一个伟大的答案，你也没有因此停止追问。\n\n在另一个人生里，火箭已经开始占据某人的想象。在这里，实验室的灯仍然亮着。',
    },
    {
      id: 'independent',
      title: '自己的尺度',
      subtitle: 'ON YOUR OWN TERMS',
      conditions: [{ tag: 'end_independent' }],
      narrative:
        '公司没有变成传奇。它是一间能运转的办公室，一群愿意留下的人，和每天需要认真解决的真实问题。\n\n你没有得到无限资源，也没有把决定权全部交出去。偶尔你仍会盯着更大的计划出神。\n\n至少今天，当有人问下一步做什么，白板笔还握在你手里。',
    },
  ],
};
