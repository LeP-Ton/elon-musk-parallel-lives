'use client';
/* eslint-disable next/no-img-element -- 静态双托管直接使用预生成资源，不依赖服务端图片优化。 */
import { useEffect, useState } from 'react';
import type { Choice, Game, Registry } from '../game/types';
import { availableChoices, currentNode, currentText } from '../engine/runtime';
import { assetUrl } from '../game/assets';
import { ArrowRight } from 'lucide-react';

type Props = {
  game: Game;
  registry: Registry;
  fontSize: number;
  motion: boolean;
  playing: boolean;
  blocked: boolean;
  planned?: Choice | null;
  onAdvance: () => void;
  onChoose: (id: string) => void;
  onPause: () => void;
};

/** 文字显现是临时状态；切换节点/读档不会触发任何人生效果。 */
function Dialogue({
  text,
  advance,
  motion,
  blocked,
  playing,
  phase,
}: {
  text: string;
  advance: () => void;
  motion: boolean;
  blocked: boolean;
  playing: boolean;
  phase: Game['phase'];
}) {
  const [revealed, setRevealed] = useState(motion ? 0 : text.length);
  const full = !motion || playing || revealed >= text.length;
  useEffect(() => {
    if (full || blocked) return;
    const tick = setInterval(
      () => setRevealed((n) => Math.min(text.length, n + 2)),
      28,
    );
    return () => clearInterval(tick);
  }, [text, full, blocked]);
  const step = () => {
    if (!full) setRevealed(text.length);
    else if (phase !== 'choice' && phase !== 'ending') advance();
  };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (
        blocked ||
        e.repeat ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (e.target instanceof HTMLElement &&
          e.target.closest('input,textarea,select,button,a,[role="dialog"]'))
      )
        return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        step();
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  });
  return (
    <>
      <button
        type="button"
        className="vn-copy"
        disabled={blocked || (full && ['choice', 'ending'].includes(phase))}
        aria-label={full ? '点击正文继续' : '点击正文显示全文'}
        onClick={step}
      >
        <span aria-hidden="true">
          {full ? text : text.slice(0, revealed)}
          {!full && <span className="vn-caret">▌</span>}
        </span>
      </button>
      <p className="sr-only" aria-live="polite">
        {text}
      </p>
      {phase !== 'ending' && (
        <button
          className="vn-next"
          disabled={blocked || (full && phase === 'choice')}
          onClick={step}
        >
          {!full ? '显示全文' : phase === 'choice' ? '请作出选择' : '继续'}{' '}
          <ArrowRight size={16} />
        </button>
      )}
    </>
  );
}

export function NovelStage(props: Props) {
  const { game, registry, playing, blocked, planned, fontSize, motion } = props;
  const last = game.state.history.at(-1);
  const event = registry.events.find(
    (e) => e.id === (game.currentEventId ?? last?.eventId),
  )!;
  const node = currentNode(game, registry);
  const text = currentText(game, registry);
  const choices = availableChoices(game, registry);
  const cast = node && 'cast' in node ? (node.cast ?? []) : [];
  const speaker = node && 'speaker' in node ? node.speaker : undefined;
  const outcome = event.choices
    .find((c) => c.id === last?.choiceId)
    ?.outcomes.find((o) => o.id === last?.outcomeId);
  const person = registry.characters.find((c) => c.id === speaker);
  // 每幕仅预热当前立绘和紧随其后的节点；不一次下载整套图库。
  useEffect(() => {
    if (!node || !('next' in node)) return;
    const next = event.scene.script?.nodes.find((n) => n.id === node.next);
    const future = next && 'cast' in next ? (next.cast ?? []) : [];
    for (const p of future) {
      const img = new Image();
      img.src = assetUrl(
        `/assets/novel/characters/${p.character}-${p.expression}.png`,
      )!;
    }
  }, [node, event]);
  return (
    <section
      className={`vn-stage ${!motion ? 'vn-reduced' : ''}`}
      aria-label="互动小说舞台"
    >
      <div className="vn-visual">
        <img
          className="vn-background"
          src={assetUrl(
            registry.assets.find((a) => a.id === event.scene.backgroundKey)
              ?.path,
          )}
          alt={`${event.scene.location} · 原创年代插画`}
        />
        <div className="vn-vignette" />
        <div className="vn-scene-meta">
          <span>{event.chapter}</span>
          <span>
            {game.state.year} · {game.state.age}岁
          </span>
        </div>
        <div className="vn-cast">
          {cast.map((p, index) => {
            const c = registry.characters.find((c) => c.id === p.character)!;
            const expression =
              game.phase === 'result' && index === cast.length - 1
                ? (outcome?.expression ?? p.expression)
                : p.expression;
            const active =
              speaker === p.character ||
              (!speaker &&
                index === (game.phase === 'result' ? cast.length - 1 : 0));
            return (
              <img
                key={p.character}
                className={`vn-portrait ${active ? 'speaking' : 'listening'}`}
                src={assetUrl(
                  `/assets/novel/characters/${c.portrait}-${expression}.png`,
                )}
                alt={`${c.name} · ${expression} · ${c.fictional ? '原创角色' : '戏剧化形象'}`}
              />
            );
          })}
        </div>
        <div className="vn-location">{event.scene.location}</div>
      </div>
      <div className="vn-dialogue" style={{ fontSize }}>
        <div className="vn-dialogue-heading">
          <span className="vn-speaker">
            {game.phase === 'ending'
              ? '人生落笔'
              : game.phase === 'result'
                ? '选择之后'
                : node?.type === 'thought'
                  ? '埃隆 · 内心'
                  : (person?.name ?? '旁白')}
          </span>
          <span className="vn-identity">
            {event.truthType === 'ALTERNATE' || game.state.timelineDeviation > 0
              ? '平行推演 · '
              : '戏剧化 · '}
            {person?.fictional ? '原创角色 · ' : ''}非历史原话
          </span>
        </div>
        <h1 id="story-title">
          {game.phase === 'ending'
            ? registry.endings.find((e) => e.id === game.endingId)?.title
            : event.title}
        </h1>
        <Dialogue
          key={`${game.currentEventId}-${game.nodeId}-${game.phase}-${game.state.history.length}`}
          text={text}
          motion={motion}
          blocked={blocked}
          playing={playing}
          phase={game.phase}
          advance={() => {
            props.onPause();
            props.onAdvance();
          }}
        />
        {choices.length > 0 && (
          <div className="vn-choices" aria-label="当前可用选择">
            {choices.map((c, i) => (
              <button
                key={c.id}
                disabled={blocked}
                className={`vn-choice ${planned?.id === c.id ? 'auto-planned' : ''}`}
                onClick={() => props.onChoose(c.id)}
              >
                <span className="vn-choice-number">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong>{c.text}</strong>
                  <small>{c.hint}</small>
                  {planned?.id === c.id && (
                    <small>即将自动选择 · 点击可接管</small>
                  )}
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
