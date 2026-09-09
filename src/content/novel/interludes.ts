import type { SceneDraft } from './build';
const chapter = '人生插曲 · 先前的回声';
export const interludes: SceneDraft[] = [
  {
    id: 'echo-letter',
    title: '信已经有了回音',
    chapter,
    year: 1989,
    background: 'airport',
    interlude: true,
    next: 'noticeboard',
    lines: [
      'n|辗转于住处和工作之间的一次等车，你读到家里的回信。它没有给你一份更正确的人生规划，只回应你写下的那几个具体困难。你承认过不知道，所以对方终于知道可以怎样帮助。',
      'n|原来她真的读到了，不是只看见“我很好”。你把那一页翻回来，发现自己已经不像写信时那样羞于承认刚到时的窘迫。',
      'n|信里夹着一句很普通的提醒，让你记得吃饭。它与你写过的程序没有关系，却忽然把两段相隔很远的生活连在一起。你还没有做成足够大的事，也已经有人愿意认真听。',
    ],
    question: '你怎样回应这份关心？',
    options: [
      {
        id: 'reply',
        text: '回信，补充已经解决和仍需帮助的事',
        hint: '让联系成为双向，而不只是报喜或求助。',
        result:
          '你也问了家里的近况。下一封信终于不再只有你一个人的行程，离开没有让所有关系都变成围绕主角旋转的背景。',
        effect: {
          relationships: { maye: 5 },
          effects: [{ stat: 'stress', delta: -3 }],
        },
      },
      {
        id: 'keep',
        text: '仔细收好，等生活更稳定时再回',
        hint: '关心被保留，但回应仍被推迟。',
        result:
          '你把信夹进本子。它会继续陪着你，却不能替你把下一封回信写出来。你给待办事项添上一行，这一次知道那行字另一端是一个人。',
        effect: { effects: [{ stat: 'energy', delta: 2 }] },
      },
    ],
    after: [
      'i|后来进入校园，你仍带着这封信。它不保证所有陌生人都会善待你，只提醒你，真实地开口有时比努力显得无所不知更有用。',
    ],
  },
  {
    id: 'echo-credit',
    title: '下一次邀请',
    chapter,
    year: 1992,
    background: 'dorm',
    interlude: true,
    next: 'fundraiser',
    lines: [
      'n|克莱尔寄来新的访谈提纲，这次没有先问成果最后归谁。上一份报告的共同署名已经回答过一次。信里夹着几个批注，不是赞同，而是她愿意继续投入时间的证据。',
      'claire:happy|有人读到我们的方法，想请你解释模型。我把你的地址给他们了。不是每个人都喜欢结论，不过至少他们知道该分别向谁提问题。',
      'n|你发现署名并没有稀释自己的贡献，反而让别人更清楚哪些问题适合来找你。合作不是把名字排在一行之后就不能分开判断。',
    ],
    question: '你怎样使用新的合作机会？',
    options: [
      {
        id: 'invite',
        text: '邀请她一起回应，明确新项目分工',
        hint: '继续让贡献与机会共同流动。',
        result:
          '你们为新的分工先写了三行说明。事情没有因此显得斤斤计较，后面的讨论反而少了一层需要猜测的意思。',
        effect: {
          relationships: { claire: 5 },
          effects: [{ stat: 'network', delta: 4 }],
        },
      },
      {
        id: 'technical',
        text: '只承担模型解释，暂不加入新项目',
        hint: '在能力和时间范围内回应，不承诺过多。',
        result:
          '你说明自己的空闲有限，仍认真回答了技术问题。克莱尔说这样也好，她可以根据真实边界寻找下一位合作者，而不是等一个不会出现的空闲周末。',
        effect: {
          relationships: { claire: 2 },
          effects: [{ stat: 'technical', delta: 2 }],
        },
      },
    ],
    after: [
      'n|这份邀请并不保证任何事业成功。它只是证明，上一次如何处理共同成果，会改变下一次别人愿不愿意让你进入他们的工作。',
    ],
  },
  {
    id: 'echo-rest',
    title: '还亮着的屏幕',
    chapter,
    year: 1996,
    background: 'office',
    interlude: true,
    next: 'founder-board',
    lines: [
      'n|丹以短期协作的身份来帮忙，晚上已经接近结束。你又发现一个值得修的问题，开口前却想起大学时的打印机。那个“别把通宵强加给别人”的约定，如今不再只关系到一墙之隔的人。',
      'dan:worried|我今天能做到这里。你可以继续，但明天我还要处理自己的工作。别替我答应客户，今晚一定会把剩下的都做完。',
      'elon:thoughtful|问题确实重要，但重要不能替另一个人决定他今晚应该留下。我可以改变自己的安排，不能把那种改变自动乘以整个团队的人数。',
    ],
    question: '你是否让同伴按时离开？',
    options: [
      {
        id: 'release',
        text: '让他按约定离开，写好交接再决定自己是否继续',
        hint: '兑现不强加通宵的边界。',
        result:
          '丹把最后一步记清，说明天可以继续。你没有得到更多工作小时，却保住了一个以后仍愿意回来的人。',
        effect: {
          promises: { rest: 'kept' },
          relationships: { dan: 7 },
          effects: [{ stat: 'stress', delta: -3 }],
        },
      },
      {
        id: 'pressure',
        text: '请求再留一小时，用紧急性说服他',
        hint: '短期加速，也改变他对合作边界的判断。',
        result:
          '他留下处理关键部分，离开时说下次需要更明确的时间。工作推进了，你也听见了一个不是在讨价还价的提醒。',
        risky: true,
        effect: {
          promises: { rest: 'broken' },
          relationships: { dan: -9 },
          effects: [{ stat: 'technical', delta: 3 }],
        },
      },
    ],
    after: [
      'n|第二天你整理昨晚的记录，发现疲惫时做出的一个修补需要重做。它不证明通宵永远错误，只证明人的体力也是系统中的真实条件，不会因为愿景重要而失效。',
    ],
  },
  {
    id: 'echo-privacy',
    title: '可以卖的钱',
    chapter,
    year: 1996,
    background: 'office',
    interlude: true,
    next: 'engineer-exit',
    alternate: true,
    lines: [
      'n|一个商业合作提议要求更细的用户记录。对方说不需要姓名，只需要能够长期识别同一个人的活动。你看向此前写下的最少收集原则，知道换一个说法并没有改变这些数据能做什么。',
      'dan:worried|如果答应，短期收入会更好看。可我们向用户解释的范围不是这样。你还愿意为当时那份说明坚持吗？',
      'elon:thoughtful|工程师可以把字段改名，却不能因此让它忘记指向谁。我们需要一个不用私人轨迹也能回答商业问题的办法，而不是只把交易称作技术优化。',
    ],
    question: '你如何回应这笔收入？',
    options: [
      {
        id: 'aggregate',
        text: '只提供无法追踪个人的汇总统计',
        hint: '兑现不出售私人资料的承诺。',
        result:
          '合作范围缩小了。丹把不可提供的字段写进测试，让以后修改这项决定的人不能在不知道的情况下越过它。',
        effect: {
          promises: { privacy: 'kept' },
          relationships: { dan: 8 },
          effects: [{ stat: 'reputation', delta: 4 }],
        },
      },
      {
        id: 'sell',
        text: '接受细粒度合作，之后再修改说明',
        hint: '违背既有边界，承担信任损失。',
        result:
          '你得到了眼前的合作，丹却不再愿意把你的旧承诺作为评审依据。解释可以修改，曾经依据旧解释使用产品的人不会因此自动同意。',
        risky: true,
        effect: {
          promises: { privacy: 'broken' },
          relationships: { dan: -12 },
          effects: [{ stat: 'wealth', delta: 600 }],
        },
      },
    ],
    after: [
      'n|你第一次清楚看见，一个没有出现在前台的按钮也会改变人生路线。后来要请丹支持新的工作时，他会记得这次你怎样使用别人看不见的权力。',
    ],
  },
  {
    id: 'echo-license',
    title: '盒子以外的权利',
    chapter,
    year: 1996,
    background: 'meeting',
    interlude: true,
    next: 'games-release',
    alternate: true,
    lines: [
      'n|马丁提到一个改编机会。因为你先前保留了续作与改编边界，这一次讨论必须来问你，而不是只发一封已经决定的通知。你发现权利的价值，有时表现为能够多问一句为什么。',
      'publisher:neutral|合作方喜欢那个世界，但想简化人物关系。你可以拒绝，也可以限定授权范围。只是不能让他们投入以后，再宣布原来什么都不能改。',
      'elon:thoughtful|我不需要每一句台词都一样。我需要他们明白，选择与回应不是可以随便拆掉的装饰。如果只保留名字和场景，那已经是另一个作品。',
    ],
    question: '你如何使用保留下来的权利？',
    options: [
      {
        id: 'define',
        text: '说明不可删除的核心，允许其他部分重新创作',
        hint: '把自主权变成可合作的边界。',
        result:
          '马丁把要求整理成几项清楚条件，愿意带回去继续谈。保留权利不是永远拒绝，而是让同意知道自己究竟同意了什么。',
        effect: {
          relationships: { publisher: 6 },
          effects: [{ stat: 'business', delta: 3 }],
        },
      },
      {
        id: 'decline',
        text: '暂不授权，专注完成自己的版本',
        hint: '放弃眼前收入，保留创作时间。',
        result:
          '你礼貌拒绝，没有指责别人不懂作品。马丁收起文件，把下一项交付日期提醒了一遍。你保住了决定权，也仍需完成已经答应的事。',
        effect: {
          relationships: { publisher: 2 },
          effects: [{ stat: 'autonomyConflict', delta: -3 }],
        },
      },
    ],
    after: [
      'n|这场会谈之所以存在，是因为前面的选择没有被剧情清空。你并没有获得更容易的人生，只获得了一次本来可能不会属于你的决定。',
    ],
  },
  {
    id: 'echo-record',
    title: '有人愿意重复失败',
    chapter,
    year: 1996,
    background: 'campus',
    interlude: true,
    next: 'research-grant',
    alternate: true,
    lines: [
      'n|另一组研究者来信，指出你记录中的一项测量可能受到环境影响。因为你保留了完整方法，他们能够提出具体的修正，而不是先猜测你遗漏了什么。失败记录第一次带来新的工作入口。',
      'claire:happy|他们没有答应证明你正确，只说愿意把同一项条件重新控制一遍。你当初决定公开的时候，应该也包括这种可能。',
      'elon:thoughtful|如果他们指出的问题是真的，我们得改结论。那会让之前的摘要更不漂亮，但会让下一轮实验少一点盲目。',
    ],
    question: '你如何回应针对自己方法的批评？',
    options: [
      {
        id: 'correct',
        text: '核对后公开修正，邀请继续复核',
        hint: '让可复核不是一句只在没有批评时有效的承诺。',
        result:
          '你写出修正说明，也保留了旧记录供对照。克莱尔说这会让一些人更信任你，不是因为你没犯错，而是他们知道错误被发现以后会发生什么。',
        effect: {
          promises: { report: 'kept' },
          relationships: { claire: 6 },
          effects: [{ stat: 'technical', delta: 4 }],
        },
      },
      {
        id: 'check',
        text: '先独立验证，约定明确的答复日期',
        hint: '不急于接受或否认，以行动回应质疑。',
        result:
          '你没有立即让步，也没有把对方当成敌人。时间被写清以后，讨论能够等待一项具体工作，而不是等待你愿意承认的那一天。',
        effect: {
          relationships: { claire: 3 },
          effects: [{ stat: 'technical', delta: 3 }],
        },
      },
    ],
    after: [
      'n|接下来的资助讨论仍然可能失败。但这封信给了你一份不同于自我介绍的材料：有人真的使用过你的记录，而且能够沿着它继续。',
    ],
  },
];
