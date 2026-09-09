import type {
  Choice,
  Condition,
  LifeEvent,
  Outcome,
  ScriptNode,
} from '../../game/types';
export type Option = {
  id: string;
  text: string;
  hint: string;
  result: string;
  effect?: Partial<Outcome>;
  requirements?: Condition[];
  risky?: boolean;
  alternate?: { text: string; effect?: Partial<Outcome> };
};
export type SceneDraft = {
  id: string;
  title: string;
  chapter: string;
  year: number;
  background: string;
  /** n为旁白，i为主角内心，角色:表情为对白。每段拆成独立演出节点。 */
  lines: string[];
  question: string;
  options: Option[];
  after: string[];
  next?: string;
  nextYear?: number;
  ending?: string;
  routes?: { when: Condition[]; next: string }[];
  echo?: { when: Condition[]; yes: string; no: string };
  interlude?: boolean;
  alternate?: boolean;
};
export const heroAt = (year: number) =>
  year < 1989 ? 'elon-child' : year < 1995 ? 'elon-youth' : 'elon-adult';
/** 编译时生成稳定图，不在运行时拼凑对白或随机灌水。 */
export function buildScene(d: SceneDraft): LifeEvent {
  const hero = heroAt(d.year);
  const lines = [...d.lines, ...d.after];
  const partner = lines
    .map((s) => s.split('|')[0].split(':')[0])
    .find((s) => !['n', 'i', 'elon', hero].includes(s));
  const cast = [
    { character: hero, expression: 'neutral' as const },
    ...(partner
      ? [{ character: partner, expression: 'neutral' as const }]
      : []),
  ];
  // 配角没有thoughtful贴图，主角年龄也由场景年份确定。
  const nodeFor = (line: string, id: string, next: string): ScriptNode => {
    const [who, ...body] = line.split('|');
    const [raw, expression = 'neutral'] = who.split(':');
    const speaker = raw === 'elon' || raw === 'i' ? hero : raw;
    return {
      id,
      type: raw === 'n' ? 'narration' : raw === 'i' ? 'thought' : 'dialogue',
      speaker: raw === 'n' ? undefined : speaker,
      text: body.join('|'),
      next,
      cast: cast.map((p) =>
        p.character === speaker
          ? {
              ...p,
              expression: (raw === 'i'
                ? 'thoughtful'
                : expression) as typeof p.expression,
            }
          : p,
      ),
    };
  };
  const nodes: ScriptNode[] = d.lines.map((line, i) =>
    nodeFor(
      line,
      `line-${i}`,
      i === d.lines.length - 1 ? 'decision' : `line-${i + 1}`,
    ),
  );
  if (d.echo) {
    nodes.unshift(
      {
        id: 'echo',
        type: 'branch',
        branches: [{ when: d.echo.when, next: 'echo-yes' }],
        fallback: 'echo-no',
      },
      nodeFor(d.echo.yes, 'echo-yes', 'line-0'),
      nodeFor(d.echo.no, 'echo-no', 'line-0'),
    );
  }
  nodes.push({
    id: 'decision',
    type: 'choice',
    text: d.question,
    choices: d.options.map((o) => o.id),
    cast,
  });
  nodes.push(
    ...d.after.map((line, i) =>
      nodeFor(
        line,
        `after-${i}`,
        i === d.after.length - 1 ? 'end' : `after-${i + 1}`,
      ),
    ),
  );
  nodes.push({
    id: 'end',
    type: 'end',
    nextEventId: d.next,
    year: d.nextYear,
    endingId: d.ending,
    routes: d.routes,
  });
  const choices: Choice[] = d.options.map((o) => ({
    id: o.id,
    text: o.text,
    hint: o.hint,
    requirements: o.requirements,
    affinity: o.risky
      ? { autonomy: 1, riskTolerance: 0.6, engineeringDrive: 0.5 }
      : { curiosity: 0.5, stabilityNeed: 0.6 },
    outcomes: [
      {
        id: `${o.id}-response`,
        weight: o.alternate ? 65 : 1,
        narrative: o.result,
        expression: o.risky ? 'worried' : 'happy',
        nextNodeId: d.after.length ? 'after-0' : 'end',
        ...o.effect,
      },
      ...(o.alternate
        ? [
            {
              id: `${o.id}-setback`,
              weight: 35,
              narrative: o.alternate.text,
              expression: 'angry' as const,
              nextNodeId: d.after.length ? 'after-0' : 'end',
              ...o.alternate.effect,
            },
          ]
        : []),
    ],
  }));
  return {
    id: d.id,
    title: d.title,
    chapter: d.chapter,
    truthType: d.alternate ? 'ALTERNATE' : 'CANON_DRAMATIZED',
    historicalConfidence: d.alternate ? 'alternate' : 'medium',
    sourceRefs: ['wharton-2009', 'queens-2013'],
    historicalNote:
      '年代与人生节点参考资料；具体场景、内心和全部对白是原创戏剧化，不是历史原话。原创配角不对应真实个人。',
    conditions: [
      { field: 'year', gte: d.year },
      ...(d.id === 'room' ? [] : [{ history: 'room' } as Condition]),
    ],
    priority: d.id === 'room' ? 100 : 0,
    once: true,
    category: 'visual-novel',
    storyRole: d.interlude ? 'minor' : 'major',
    scene: {
      country: d.year < 1989 ? '南非' : d.year < 1992 ? '加拿大' : '美国',
      city:
        d.year < 1989
          ? '比勒陀利亚'
          : d.year < 1990
            ? '抵达加拿大'
            : d.year < 1992
              ? '金斯顿'
              : d.year < 1995 || d.id === 'departure'
                ? '费城'
                : '硅谷',
      location: (
        {
          bedroom: '比勒陀利亚 · 少年卧室',
          airport: d.year < 1995 ? '加拿大 · 机场大厅' : '离开费城 · 机场大厅',
          campus: d.year < 1992 ? '加拿大 · 大学图书馆' : '大学 · 图书馆',
          dorm: '大学 · 宿舍',
          recruitment: '硅谷 · 招聘大厅',
          office: '硅谷 · 狭小办公室',
          meeting: '硅谷 · 会议室',
          apartment: '城市 · 公寓',
        } as Record<string, string>
      )[d.background],
      year: d.year,
      timeOfDay: '一段尚未写定的时间',
      backgroundKey: `vn-${d.background}`,
      atmosphere: '话语落下之后，选择才有了重量。',
      openingNarrative: d.lines[0].split('|').slice(1).join('|'),
      script: { entry: d.echo ? 'echo' : 'line-0', nodes },
    },
    choices,
  };
}
