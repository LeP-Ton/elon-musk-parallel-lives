/** 内容和运行时共享的声明式契约；事件不能直接调用界面或修改存档。 */
export type Truth = 'CANON_FACT' | 'CANON_DRAMATIZED' | 'ALTERNATE';
export type SourceRef = {
  id: string;
  title: string;
  type: 'official' | 'interview' | 'biography' | 'news' | 'archive';
  url: string;
  year: number;
  note: string;
};
export type Stat =
  | 'wealth'
  | 'income'
  | 'technical'
  | 'business'
  | 'network'
  | 'reputation'
  | 'influence'
  | 'energy'
  | 'stress'
  | 'autonomyConflict'
  | 'ambitionPressure'
  | 'unresolvedProblemPressure';
export type Condition =
  | { relationship: string; gte?: number; lte?: number }
  | { promise: string; status: PromiseStatus }
  | { field: Stat | 'year' | 'age'; gte?: number; lte?: number }
  | { tag: string; absent?: boolean }
  | { history: string; absent?: boolean }
  | { career: string }
  | { any: Condition[][] };
export type Effect = { stat: Stat; delta: number };
export type Affinity = {
  autonomy?: number;
  engineeringDrive?: number;
  curiosity?: number;
  riskTolerance?: number;
  stabilityNeed?: number;
  ambition?: number;
};
export type Outcome = {
  id: string;
  weight: number;
  narrative: string;
  conditions?: Condition[];
  modifiers?: { field: Stat; factor: number; tag?: string }[];
  effects?: Effect[];
  addTags?: string[];
  removeTags?: string[];
  year?: number;
  career?: string;
  company?: string;
  city?: string;
  country?: string;
  nextEventId?: string;
  deviation?: number;
  relationships?: Record<string, number>;
  promises?: Record<string, PromiseStatus>;
  nextNodeId?: string;
  expression?: Expression;
};
export type PromiseStatus = 'pending' | 'kept' | 'broken';
export type Expression =
  | 'neutral'
  | 'thoughtful'
  | 'happy'
  | 'worried'
  | 'angry'
  | 'sad';
export type Portrait = { character: string; expression: Expression };
/** 场内图只声明内容；分支解析和效果结算由引擎完成。 */
export type ScriptNode =
  | {
      id: string;
      type: 'narration' | 'dialogue' | 'thought';
      text: string;
      speaker?: string;
      cast?: Portrait[];
      next: string;
    }
  | {
      id: string;
      type: 'choice';
      text: string;
      choices: string[];
      cast?: Portrait[];
    }
  | {
      id: string;
      type: 'branch';
      branches: { when: Condition[]; next: string }[];
      fallback: string;
    }
  | {
      id: string;
      type: 'end';
      nextEventId?: string;
      year?: number;
      endingId?: string;
      routes?: { when: Condition[]; next: string }[];
    };
export type Character = {
  id: string;
  name: string;
  identity: string;
  fictional: boolean;
  era: [number, number];
  expressions: Expression[];
  portrait: string;
};
export type Choice = {
  id: string;
  text: string;
  hint: string;
  requirements?: Condition[];
  affinity?: Affinity;
  autonomyCost?: number;
  outcomes: Outcome[];
};
export type NarrativeScene = {
  country?: string;
  city?: string;
  script?: { entry: string; nodes: ScriptNode[] };
  location: string;
  year: number;
  timeOfDay: string;
  backgroundKey: string;
  characterKeys?: string[];
  propKeys?: string[];
  audioKey?: string;
  atmosphere: string;
  openingNarrative: string;
  dialogue?: { speaker: string; text: string }[];
  variants?: { when: Condition[]; text: string }[];
};
export type LifeEvent = {
  id: string;
  title: string;
  chapter: string;
  truthType: Truth;
  historicalConfidence: 'high' | 'medium' | 'disputed' | 'alternate';
  sourceRefs?: string[];
  historicalNote?: string;
  conditions: Condition[];
  priority: number;
  urgency?: number;
  storyRole: 'anchor' | 'major' | 'minor' | 'random';
  category: string;
  expiresAt?: number;
  cooldownGroup?: string;
  cooldown?: number;
  once?: boolean;
  scene: NarrativeScene;
  choices: Choice[];
};
export type RandomEventDefinition = LifeEvent & {
  storyRole: 'random';
  pool: string;
  baseWeight: number;
};
export type Ending = {
  id: string;
  title: string;
  subtitle: string;
  narrative: string;
  conditions: Condition[];
};
export type Asset = {
  id: string;
  type: 'background' | 'character' | 'prop' | 'overlay' | 'audio';
  path: string;
  era: string;
};
export type ContentPack = {
  characters?: Character[];
  /** 由调试或入口系统提供的标签，用于内容静态可达性分析。 */
  entryTags?: string[];
  id: string;
  version: string;
  requires?: string[];
  events?: LifeEvent[];
  randomEvents?: RandomEventDefinition[];
  endings?: Ending[];
  assets?: Asset[];
  sources?: SourceRef[];
  tags?: string[];
};
export type HistoryEntry = {
  nodeId?: string;
  eventId: string;
  choiceId: string;
  outcomeId: string;
  year: number;
  truthType: Truth;
  roll: number;
  weights: number[];
  stream: string;
  attempt: number;
  deviation: number;
};
export type LifeState = Record<Stat, number> & {
  relationships: Record<string, number>;
  promises: Record<string, PromiseStatus>;
  year: number;
  age: number;
  currentCountry: string;
  currentCity: string;
  currentCareer: string;
  currentCompany: string;
  currentIdentity: string;
  tags: string[];
  history: HistoryEntry[];
  timelineDeviation: number;
  seed: string;
  simulationProfileVersion: string;
};
export type Game = {
  schemaVersion: 2;
  state: LifeState;
  currentEventId: string | null;
  phase: 'reading' | 'choice' | 'result' | 'ending';
  nodeId?: string;
  visitedScenes: string[];
  /** 只记录已读文本的引用，不把正文或播放时钟写入存档。 */
  transcript: {
    eventId: string;
    nodeId: string;
    outcomeId?: string;
    choiceId?: string;
  }[];
  endingId: string | null;
  pendingEventId?: string;
  attempts: Record<string, number>;
  contentVersions: Record<string, string>;
};
export type Registry = {
  characters: Character[];
  packs: ContentPack[];
  events: LifeEvent[];
  endings: Ending[];
  assets: Asset[];
  sources: SourceRef[];
  tags: Set<string>;
  versions: Record<string, string>;
};
