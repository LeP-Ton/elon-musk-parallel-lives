'use client';
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  ArrowRight,
  BookOpen,
  GitBranch,
  Fingerprint,
  Bookmark,
  X,
  Library,
  RotateCcw,
  Bug,
  Check,
  Download,
  Play,
  Pause,
  Shuffle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { registry as initialRegistry } from '../content/registry';
import type { Game as GameState, Registry, Stat } from '../game/types';
import {
  advance,
  choose,
  availableChoices,
  newGame,
  sceneTruth,
} from '../engine/runtime';
import {
  deserialize,
  loadSlot,
  saveSlot,
  serialize,
  legacyBackups,
  type SaveSlot,
} from '../game/save';
import { canonTimeline } from '../research/canonTimeline';
import { registerGameTools, type GameModelContext } from '../game/webmcp';
import { Inspector } from './Inspector';
import { freshWorldSeed, type PlaybackSpeed } from '../engine/autoplay';
import { useAutoplay } from './useAutoplay';
import { NovelStage } from './NovelStage';
import { NovelInspector } from './NovelInspector';
import { promiseNames } from '../content/novel/characters';

type Panel =
  | 'log'
  | 'profile'
  | 'timeline'
  | 'save'
  | 'sources'
  | 'new'
  | 'debug'
  | null;
const truthLabels = {
  CANON_FACT: '真实历史',
  CANON_DRAMATIZED: '历史场景 · 艺术重现',
  ALTERNATE: '平行人生 · 假设推演',
};
const statNames: Record<Stat, string> = {
  wealth: '财富',
  income: '年收入',
  technical: '技术',
  business: '商业判断',
  network: '人脉',
  reputation: '声望',
  influence: '影响力',
  energy: '精力',
  stress: '压力',
  autonomyConflict: '自主冲突',
  ambitionPressure: '野心压力',
  unresolvedProblemPressure: '未解问题压力',
};
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function Game() {
  const [registry, setRegistry] = useState<Registry>(initialRegistry);
  const [game, setGame] = useState(() => newGame(initialRegistry));
  const [panel, setPanelState] = useState<Panel>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [seed, setSeed] = useState('MUSK-88421');
  const [resume, setResume] = useState<SaveSlot | null>(null);
  const [slots, setSlots] = useState<(SaveSlot | string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [replaceSlot, setReplaceSlot] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [motion, setMotion] = useState(true);
  const [oldBackups, setOldBackups] = useState<{ slot: number; raw: string }[]>(
    [],
  );
  const lastScrolledScene = useRef<string | null>(null);
  const [dev, setDev] = useState(false);
  const [ready, setReady] = useState(false);
  const pristineRef = useRef(true);
  const gameRef = useRef(game);
  const registryRef = useRef(registry);
  const fileRef = useRef<HTMLInputElement>(null);
  const commitRef = useRef<(g: GameState) => void>(() => {});
  const autoplay = useAutoplay({
    game,
    registry,
    blocked: !ready || Boolean(panel || resume || error),
    onStep: (next) => {
      commit(next, true);
      scrollToStory();
    },
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : String(cause)),
  });
  function commit(next: GameState, automatic = false): void {
    if (!automatic) autoplay.pause();
    pristineRef.current = false;
    gameRef.current = next;
    setGame(next);
    setResume(null);
    setError('');
    try {
      saveSlot(localStorage, 0, next);
      setNotice('已自动保存');
    } catch (e) {
      autoplay.pause();
      setError(e instanceof Error ? e.message : String(e));
    }
  }
  useLayoutEffect(() => {
    commitRef.current = commit;
  });
  function register(next: Registry) {
    autoplay.pause();
    registryRef.current = next;
    setRegistry(next);
  }
  function safely(action: () => void) {
    try {
      setError('');
      action();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }
  // 初始化与读取浏览器存储是外部系统同步，不能在SSR渲染时访问。
  /* eslint-disable react/react-compiler */
  useEffect(() => {
    setDev(import.meta.env.DEV);
    setMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    try {
      setResume(loadSlot(localStorage, 0, registryRef.current));
    } catch (e) {
      setError(String(e));
    }
    setReady(true);
    const context = (document as Document & { modelContext?: GameModelContext })
      .modelContext;
    return registerGameTools(
      context,
      () => gameRef.current,
      () => registryRef.current,
      (g) => commitRef.current(g),
    );
  }, []);
  useEffect(() => {
    if (panel !== 'save') return;
    try {
      setOldBackups(legacyBackups(localStorage));
    } catch {
      setNotice('旧档暂时无法读取，请检查浏览器存储权限。');
    }
    setSlots(
      [0, 1, 2, 3].map((i) => {
        try {
          return loadSlot(localStorage, i, registry);
        } catch (e) {
          return e instanceof Error ? e.message : String(e);
        }
      }),
    );
  }, [panel, registry, game]);
  /* eslint-enable react/react-compiler */
  const last = game.state.history.at(-1);
  const event =
    registry.events.find(
      (e) => e.id === (game.currentEventId ?? last?.eventId),
    ) ?? registry.events[0];
  const choices = availableChoices(game, registry);
  const truth =
    game.phase === 'result'
      ? (last?.truthType ?? sceneTruth(event, game.state))
      : sceneTruth(event, game.state);
  function setPanel(next: Panel) {
    autoplay.pause();
    setPanelState(next);
  }
  function scrollToStory() {
    if (lastScrolledScene.current === gameRef.current.currentEventId) return;
    lastScrolledScene.current = gameRef.current.currentEventId;
    requestAnimationFrame(() =>
      document
        .querySelector('.vn-stage')
        ?.scrollIntoView({ behavior: 'instant', block: 'start' }),
    );
  }
  function startAutoplay() {
    if (!ready || resume || error || game.phase === 'ending') return;
    safely(() => {
      // 初次观看不用每个人都相同的演示种子；暂停、接管和读档则保留当前种子。
      if (pristineRef.current) {
        const nextSeed = freshWorldSeed();
        commit(newGame(registry, nextSeed));
        setSeed(nextSeed);
      }
      autoplay.start();
    });
  }
  function prepareRandomLife() {
    safely(() => {
      setSeed(freshWorldSeed());
      setPanel('new');
    });
  }
  function turn(action: () => GameState) {
    safely(() => {
      autoplay.pause();
      commit(action());
      scrollToStory();
    });
  }
  // 快捷键读取最新播放态，倒计时更新无需反复注销、注册全局监听器。
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (
      panel ||
      e.repeat ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      (e.target instanceof HTMLElement &&
        e.target.closest('input,textarea,select,button,a'))
    )
      return;
    if (game.phase === 'choice' && /^[1-4]$/.test(e.key)) {
      const c = choices[Number(e.key) - 1];
      if (c) {
        e.preventDefault();
        turn(() => choose(gameRef.current, registryRef.current, c.id));
      }
    }
  });
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
  function manualSave(index: number) {
    safely(() => {
      saveSlot(localStorage, index, game);
      setReplaceSlot(null);
      setSlots((previous) =>
        previous.map((s, i) =>
          i === index ? { game, savedAt: new Date().toISOString() } : s,
        ),
      );
      setNotice(`已保存到存档 ${index}`);
    });
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([serialize(game)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `parallel-lives-${game.state.year}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const panelTitle = {
    log: '已经说过的话',
    profile: '人生档案',
    timeline: '两条人生，同一个时代',
    save: '留住这一刻',
    sources: '历史与虚构之间',
    new: '另一种人生',
    debug: '叙事开发检查器',
  };
  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            Ⅱ
          </span>
          <div>
            平行人生<small>ELON MUSK · PARALLEL LIVES</small>
          </div>
        </div>
        <nav aria-label="游戏导航">
          <button
            className={!panel ? 'active' : ''}
            onClick={() => setPanel(null)}
          >
            <BookOpen size={17} />
            故事
          </button>
          <button
            className={panel === 'profile' ? 'active' : ''}
            onClick={() => setPanel('profile')}
          >
            <Fingerprint size={17} />
            人生档案
          </button>
          <button
            className={panel === 'timeline' ? 'active' : ''}
            onClick={() => setPanel('timeline')}
          >
            <GitBranch size={17} />
            世界线
          </button>
        </nav>
        <button className="save-button" onClick={() => setPanel('save')}>
          <Bookmark size={17} />
          存档
        </button>
      </header>
      <div className="play-layout">
        <aside className="chapter-rail" aria-hidden>
          <span className="vertical-word">一 生 ， 不 止 一 种 可 能</span>
          <div className="chapter-track">
            {[1983, 1989, 1992, 1995].map((y, i) => (
              <span className="track-segment" key={y}>
                <i className={game.state.year >= y ? 'lit' : ''} />
                {i < 3 && <span />}
              </span>
            ))}
          </div>
          <small>
            早期人生篇
            <br />
            1983—1999
          </small>
        </aside>
        <section className="reading-stage">
          {resume && (
            <div className="resume-banner">
              <span>你的人生停在了 {resume.game.state.year} 年。</span>
              <button onClick={() => commit(resume.game)}>
                继续上次故事 <ArrowRight size={14} />
              </button>
              <button
                aria-label="暂时收起继续提示"
                onClick={() => setResume(null)}
              >
                <X size={15} />
              </button>
            </div>
          )}
          <details
            className="autoplay-toolbar"
            onToggle={(e) => {
              if (!e.currentTarget.open) autoplay.pause();
            }}
          >
            <summary>观众模式 · 让故事自动演化</summary>
            <section aria-label="自动播放控制">
              <div className="autoplay-controls">
                <div className="autoplay-heading">
                  <span
                    className={
                      autoplay.playing ? 'live-dot is-playing' : 'live-dot'
                    }
                    aria-hidden
                  />
                  <strong>观众模式</strong>
                  <output id="autoplay-status">
                    {game.phase === 'ending'
                      ? '本轮已结束'
                      : autoplay.playing
                        ? '正在演化'
                        : '等待播放'}
                  </output>
                </div>
                <div className="autoplay-actions">
                  <Button
                    className="autoplay-toggle"
                    onClick={() =>
                      autoplay.playing ? autoplay.pause() : startAutoplay()
                    }
                    disabled={
                      !ready ||
                      Boolean(resume || error) ||
                      game.phase === 'ending'
                    }
                    aria-pressed={autoplay.playing}
                  >
                    {autoplay.playing ? <Pause /> : <Play />}
                    {autoplay.playing ? '暂停' : '自动播放'}
                  </Button>
                  <label className="playback-speed" htmlFor="playback-speed">
                    <span className="sr-only">播放速度</span>
                    <NativeSelect
                      id="playback-speed"
                      value={autoplay.speed}
                      onChange={(e) =>
                        autoplay.changeSpeed(
                          Number(e.target.value) as PlaybackSpeed,
                        )
                      }
                    >
                      <NativeSelectOption value={1}>1× 阅读</NativeSelectOption>
                      <NativeSelectOption value={2}>2× 快进</NativeSelectOption>
                      <NativeSelectOption value={4}>4× 速览</NativeSelectOption>
                    </NativeSelect>
                  </label>
                  <Button
                    variant="outline"
                    onClick={prepareRandomLife}
                    disabled={!ready}
                  >
                    <Shuffle />
                    随机开播
                  </Button>
                </div>
              </div>
              <p className="autoplay-caption">
                {resume ? (
                  '先继续上次故事，或用「随机开播」开启另一条人生。'
                ) : game.phase === 'ending' ? (
                  '故事在此停留。随机开播可观看新人生；不同种子也可能走向相同结局。'
                ) : autoplay.playing ? (
                  <>
                    <span role="timer" aria-live="off">
                      约 {Math.ceil(autoplay.remaining / 1000)} 秒后
                      {game.phase === 'choice' ? '作出选择' : '翻页'}。
                    </span>
                    点击任一选项可立即接管。
                  </>
                ) : (
                  '让人物倾向、现实条件与机遇推动故事。手动游玩无需开启此模式。'
                )}
              </p>
            </section>
          </details>
          <NovelStage
            game={game}
            registry={registry}
            fontSize={fontSize}
            motion={motion}
            playing={autoplay.playing}
            blocked={!ready || Boolean(panel || resume)}
            planned={autoplay.plannedChoice}
            onPause={autoplay.pause}
            onAdvance={() =>
              turn(() => advance(gameRef.current, registryRef.current))
            }
            onChoose={(id) =>
              turn(() => choose(gameRef.current, registryRef.current, id))
            }
          />
          {game.phase === 'ending' && (
            <div className="ending-actions">
              <button className="continue" onClick={() => setPanel('timeline')}>
                回望这条人生
              </button>
              <button className="secondary-action" onClick={prepareRandomLife}>
                开启另一段人生
              </button>
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <footer className="story-footer">
            <span>每一个选择，都留下回声。</span>
            <span>
              世界种子 <code>{game.state.seed}</code>
            </span>
            <output className="save-status">
              {notice && <Check size={12} />} {notice}
            </output>
          </footer>
          <div className="utility-bar">
            <button onClick={() => setPanel('sources')}>
              <Library size={14} />
              历史档案
            </button>
            <button onClick={() => setPanel('new')}>
              <RotateCcw size={14} />
              新的人生
            </button>
            <button
              aria-label="切换正文字号"
              onClick={() =>
                setFontSize((s) => (s === 18 ? 24 : s === 24 ? 36 : 18))
              }
            >
              字 {fontSize}
            </button>
            <button onClick={() => setPanel('log')}>对白回看</button>
            <button aria-pressed={!motion} onClick={() => setMotion((v) => !v)}>
              {motion ? '关闭打字与动效' : '开启打字与动效'}
            </button>
            {dev && (
              <button onClick={() => setPanel('debug')}>
                <Bug size={14} />
                开发检查器
              </button>
            )}
            <span>数字键选择 · Enter / 空格继续</span>
          </div>
        </section>
        <aside className="right-margin" aria-hidden>
          <span>ELON</span>
          <span>MUSK</span>
          <i />
          <small>
            {game.state.age} 岁<br />
            正在书写的人生
          </small>
        </aside>
      </div>

      <Dialog
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPanel(null);
            setReplaceSlot(null);
          }
        }}
      >
        <DialogContent
          className={`game-dialog ${panel === 'debug' ? 'wide-dialog' : ''}`}
          showCloseButton={false}
        >
          <DialogClose className="dialog-close" aria-label="关闭面板">
            <X size={20} />
          </DialogClose>
          <DialogTitle className="panel-title">
            {panel && panelTitle[panel]}
          </DialogTitle>
          <DialogDescription className="sr-only">
            查看和管理当前世界线，按 Escape 关闭后继续故事。
          </DialogDescription>
          {panel === 'log' && (
            <div className="vn-log">
              {game.transcript.length === 0 && (
                <p>读完的对白会留在这里。回看不会改变选择。</p>
              )}
              {game.transcript.map((line, i) => {
                const e = registry.events.find((e) => e.id === line.eventId)!;
                const node = e.scene.script?.nodes.find(
                  (n) => n.id === line.nodeId,
                );
                const choice = e.choices.find((c) => c.id === line.choiceId);
                const text = line.outcomeId
                  ? choice?.outcomes.find((o) => o.id === line.outcomeId)
                      ?.narrative
                  : node && 'text' in node
                    ? node.text
                    : '';
                return (
                  <article key={i}>
                    <small>
                      {e.title} {choice && ' · ' + choice.text}
                    </small>
                    <p>{text}</p>
                  </article>
                );
              })}
            </div>
          )}
          {panel === 'profile' && (
            <>
              <p className="panel-intro">
                {game.state.year} 年 · {game.state.age} 岁 ·{' '}
                {game.state.currentCity}
                <br />
                {game.state.currentCareer}
                {game.state.currentCompany && ` / ${game.state.currentCompany}`}
              </p>
              <div className="profile-money">
                <span>
                  当前财富<strong>{money(game.state.wealth)}</strong>
                </span>
                <span>
                  年收入<strong>{money(game.state.income)}</strong>
                </span>
              </div>
              <div className="profile-stats">
                {(
                  [
                    'technical',
                    'business',
                    'network',
                    'reputation',
                    'influence',
                    'energy',
                    'stress',
                  ] as Stat[]
                ).map((key) => (
                  <div key={key}>
                    <label>
                      {statNames[key]}
                      <span>{Math.round(game.state[key])}</span>
                    </label>
                    <Progress
                      value={game.state[key]}
                      aria-label={statNames[key]}
                    />
                  </div>
                ))}
              </div>
              <h3>你与他们</h3>
              {registry.characters
                .filter((c) => !c.id.startsWith('elon'))
                .map((c) => (
                  <article className="vn-relation" key={c.id}>
                    <strong>{c.name}</strong>
                    <small>{c.identity}</small>
                    <p>
                      {game.state.relationships[c.id] === undefined
                        ? '尚未留下共同经历'
                        : game.state.relationships[c.id] >= 60
                          ? '愿意分享顾虑，也愿意给你新的机会'
                          : game.state.relationships[c.id] < 45
                            ? '有所保留，需要行动重建信任'
                            : '正在了解彼此的边界'}
                    </p>
                  </article>
                ))}
              <h3>说出口的承诺</h3>
              {Object.entries(game.state.promises).map(([id, status]) => (
                <p key={id}>
                  {promiseNames[id] ?? id} ·{' '}
                  {
                    {
                      pending: '等待兑现',
                      kept: '已经兑现',
                      broken: '曾经失约',
                    }[status]
                  }
                </p>
              ))}
              <h3>思考方式</h3>
              <div className="trait-tags">
                {['强第一性原理', '高度好奇', '高自主需求', '高风险接受度'].map(
                  (t) => (
                    <span key={t}>{t}</span>
                  ),
                )}
              </div>
              <p className="muted">
                人物倾向是版本化的游戏模型，不是心理学诊断。
              </p>
              <h3>内心的引力</h3>
              <p className="profile-reflection">
                {game.state.autonomyConflict >= 35
                  ? '你越来越难以接受别人决定哪些问题值得解决。稳定的生活并没有让创造的冲动消退。'
                  : game.state.autonomyConflict > 10
                    ? '你正在适应现实的边界，也在留意哪些边界可以被重新定义。'
                    : '眼前的行动和内心的方向，暂时走在同一条路上。'}
              </p>
              <h3>最近的回声</h3>
              {game.state.history.length ? (
                game.state.history
                  .slice(-5)
                  .reverse()
                  .map((h, i) => (
                    <p className="memory" key={`${h.eventId}-${i}`}>
                      <span>{h.year}</span>
                      {registry.events.find((e) => e.id === h.eventId)?.title}
                    </p>
                  ))
              ) : (
                <p className="muted">故事刚刚开始，经历会留在这里。</p>
              )}
            </>
          )}
          {panel === 'timeline' && (
            <>
              <p className="panel-intro">
                历史偏离 {game.state.timelineDeviation.toFixed(0)}% ·
                偏离程度不代表人生好坏。
                <br />
                相似的创业方向可以重新汇合，已经发生的经历仍然保留。
              </p>
              {game.state.tags.includes('rejoined') && (
                <div className="rejoin-note">
                  ↗ 你的路线重新靠近了 Zip2 创业。年份和经历仍可能与现实不同。
                </div>
              )}
              <div className="timeline-grid">
                <section>
                  <h3>现实人生</h3>
                  {canonTimeline
                    .filter((h) => h.year <= Math.max(game.state.year, 1983))
                    .map((h, i) => (
                      <div className="timeline-node canon-node" key={i}>
                        <small>{h.year}</small>
                        <p>{h.title}</p>
                        <button onClick={() => setPanel('sources')}>
                          查看历史依据
                        </button>
                      </div>
                    ))}
                </section>
                <section>
                  <h3>你的人生</h3>
                  <div className="timeline-node">
                    <small>1971</small>
                    <p>故事共同的起点</p>
                  </div>
                  {game.state.history.map((h, i) => {
                    const e = registry.events.find((e) => e.id === h.eventId);
                    const c = e?.choices.find((c) => c.id === h.choiceId);
                    return (
                      <div
                        className={`timeline-node ${h.truthType === 'ALTERNATE' ? 'alternate-node' : ''}`}
                        key={`${h.eventId}-${i}`}
                      >
                        <small>
                          {h.year} ·{' '}
                          {h.truthType === 'ALTERNATE'
                            ? '平行推演'
                            : '历史场景'}
                        </small>
                        <p>{e?.title}</p>
                        <span>{c?.text}</span>
                        <em>偏离 {h.deviation.toFixed(0)}%</em>
                      </div>
                    );
                  })}
                  {!game.state.history.length && (
                    <p className="muted">你的第一个选择尚未落笔。</p>
                  )}
                </section>
              </div>
            </>
          )}
          {panel === 'sources' && (
            <>
              <p className="panel-intro">
                真实事件提供背景。所有内心、对白、具体动作与插画均为原创艺术重现；概率与平行经历是游戏推演。
              </p>
              <div className="truth-legend">
                <p>
                  <strong>真实历史</strong> 有资料支持的事件锚点。
                </p>
                <p>
                  <strong>历史场景</strong> 真实背景之上的原创叙事。
                </p>
                <p>
                  <strong>平行推演</strong> 未真实发生的选择、情境或结果。
                </p>
              </div>
              <h3>当前场景：{event.title}</h3>
              <p className="muted">
                {truthLabels[truth]} · 背景证据：
                {
                  {
                    high: '较高',
                    medium: '中等',
                    disputed: '存在分歧',
                    alternate: '纯假设',
                  }[event.historicalConfidence]
                }
              </p>
              {event.historicalNote && <p>{event.historicalNote}</p>}
              {event.truthType === 'ALTERNATE' && (
                <p>此场景属于假设人生，不代表该任职、对话或合作真实发生。</p>
              )}
              <h3>历史资料</h3>
              {registry.sources.map((source) => (
                <article className="source-card" key={source.id}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title} ↗
                  </a>
                  <small>
                    {source.year} ·{' '}
                    {event.sourceRefs?.includes(source.id)
                      ? '当前场景参考'
                      : '历史资料库'}
                  </small>
                  <p>{source.note}</p>
                </article>
              ))}
              <p className="muted">
                本篇覆盖少年到1999年的历史节点与平行推演。全部对白原创，非历史原话；2000年后的事业不在本篇范围。
              </p>
            </>
          )}
          {panel === 'save' && (
            <>
              <p className="panel-intro">
                存档保存在当前浏览器。清理浏览器数据会移除存档，可导出文件留存。
                读取后默认暂停，可从当前页重新开启自动播放。
              </p>
              <p className="muted">
                新版独立保存。旧版进度不迁移、不删除，只提供原样备份。
              </p>
              {oldBackups.map((backup) => (
                <button
                  className="secondary-action"
                  key={backup.slot}
                  onClick={() => {
                    const url = URL.createObjectURL(
                      new Blob([backup.raw], { type: 'application/json' }),
                    );
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `parallel-lives-v1-slot-${backup.slot}.json`;
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  导出旧版
                  {backup.slot === 0 ? '自动存档' : '存档 ' + backup.slot}
                </button>
              ))}
              {slots.map((slot, i) => (
                <div className="save-slot" key={i}>
                  <div>
                    <small>{i === 0 ? '自动存档' : `存档 0${i}`}</small>
                    <strong>
                      {typeof slot === 'string'
                        ? '无法读取此存档'
                        : slot
                          ? `${slot.game.state.year} 年 · ${slot.game.state.currentCareer}`
                          : '尚未留下故事'}
                    </strong>
                    <span>
                      {typeof slot === 'string'
                        ? slot
                        : slot
                          ? `${new Date(slot.savedAt).toLocaleString('zh-CN')} · ${slot.game.state.seed}`
                          : '空白存档位'}
                    </span>
                  </div>
                  <div className="slot-actions">
                    {i > 0 && (
                      <button
                        onClick={() =>
                          slot ? setReplaceSlot(i) : manualSave(i)
                        }
                      >
                        {slot ? '覆盖保存' : '保存'}
                      </button>
                    )}
                    <button
                      disabled={!slot || typeof slot === 'string'}
                      onClick={() =>
                        safely(() => {
                          const s = loadSlot(localStorage, i, registry);
                          if (s) {
                            commit(s.game);
                            setPanel(null);
                            setNotice('存档已恢复');
                          }
                        })
                      }
                    >
                      读取
                    </button>
                  </div>
                </div>
              ))}
              {replaceSlot !== null && (
                <div className="confirm-box" role="alert">
                  <p>
                    用当前 {game.state.year} 年的人生覆盖存档 {replaceSlot}？
                  </p>
                  <button onClick={() => manualSave(replaceSlot)}>
                    确认覆盖
                  </button>
                  <button onClick={() => setReplaceSlot(null)}>取消</button>
                </div>
              )}
              <div className="debug-row">
                <button className="secondary-action" onClick={download}>
                  <Download size={15} />
                  导出当前存档
                </button>
                <button
                  className="secondary-action"
                  onClick={() => fileRef.current?.click()}
                >
                  导入存档文件
                </button>
                <input
                  type="file"
                  accept="application/json,.json"
                  ref={fileRef}
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      if (file.size > 2_000_000) throw Error('存档文件过大');
                      const saved = deserialize(await file.text(), registry);
                      commit(saved.game);
                      setPanel(null);
                      setNotice('存档已导入');
                    } catch (err) {
                      setError(String(err));
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            </>
          )}
          {panel === 'new' && (
            <>
              <p className="panel-intro">
                同一个种子和相同选择，会重现同一段人生。换一个种子，让命运给出另一种回答。
              </p>
              <label className="seed-label">
                世界种子
                <input
                  value={seed}
                  maxLength={80}
                  onChange={(e) => setSeed(e.target.value)}
                  spellCheck={false}
                />
              </label>
              <button
                className="text-action"
                onClick={() => {
                  safely(() => setSeed(freshWorldSeed()));
                }}
              >
                生成新的种子 ↻
              </button>
              <p className="muted">
                开启新人生会替换自动存档，手动存档保留。当前进度可先在存档面板保存。
              </p>
              <p className="muted">
                自动播放会自行选择并翻页，同一策略与内容版本下，同一种子可复现同一轮自动人生。暂停、倍速不会重抽结果；结局可能重复。
              </p>
              <div className="ending-actions">
                <Button
                  className="watch-start"
                  disabled={!seed.trim() || !ready}
                  onClick={() =>
                    safely(() => {
                      commit(newGame(registry, seed));
                      setPanel(null);
                      autoplay.start();
                      scrollToStory();
                    })
                  }
                >
                  <Play />
                  按此种子自动播放
                </Button>
                <button
                  className="continue"
                  disabled={!seed.trim()}
                  onClick={() => {
                    commit(newGame(registry, seed));
                    setPanel(null);
                    window.scrollTo({ top: 0 });
                  }}
                >
                  从第一枚光标开始 <ArrowRight size={17} />
                </button>
              </div>
            </>
          )}
          {panel === 'debug' &&
            dev &&
            (game.contentVersions['early-visual-novel'] ? (
              <NovelInspector game={game} registry={registry} />
            ) : (
              <Inspector
                game={game}
                registry={registry}
                commit={commit}
                register={register}
              />
            ))}
          {error && panel && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
