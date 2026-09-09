'use client';
import { useState } from 'react';
import type { Game, Registry, Stat } from '../game/types';
import { inspectCandidates } from '../engine/scheduler';
import { calculateChoiceFit } from '../engine/personality';
import { outcomeWeights } from '../engine/probability';
import { profile } from '../character/elon/profile-v1';
import { createRegistry, corePacks } from '../content/registry';
import { testAlternatePack } from '../content/packs/test-alternate-pack';
import { advance } from '../engine/runtime';

export function Inspector({
  game,
  registry,
  commit,
  register,
}: {
  game: Game;
  registry: Registry;
  commit: (game: Game) => void;
  register: (registry: Registry) => void;
}) {
  const [year, setYear] = useState(String(game.state.year));
  const [seed, setSeed] = useState(game.state.seed);
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const current = registry.events.find((e) => e.id === game.currentEventId);
  const candidates = inspectCandidates(registry, game.state);
  function safely(action: () => void) {
    try {
      action();
      setError('');
    } catch (e) {
      setError(String(e));
    }
  }
  return (
    <div className="inspector">
      <p className="panel-intro">
        仅开发模式可见。下列操作会改变当前世界线；请先保存需要保留的人生。
      </p>
      <div className="debug-row">
        <label>
          跳到年份
          <input
            type="number"
            min="1983"
            max="2200"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </label>
        <button
          onClick={() =>
            safely(() => {
              const n = Number(year);
              if (!Number.isInteger(n) || n < 1983 || n > 2200)
                throw Error('年份需要在 1983—2200 之间');
              commit({
                ...game,
                state: { ...game.state, year: n, age: n - 1971 },
              });
            })
          }
        >
          修改年份
        </button>
      </div>
      <div className="debug-row">
        <label>
          世界种子
          <input
            value={seed}
            maxLength={80}
            onChange={(e) => setSeed(e.target.value)}
          />
        </label>
        <button
          onClick={() =>
            safely(() => {
              if (!seed.trim()) throw Error('种子不能为空');
              commit({ ...game, state: { ...game.state, seed: seed.trim() } });
            })
          }
        >
          修改种子
        </button>
      </div>
      <div className="debug-row">
        <label>
          内容标签
          <input value={tag} onChange={(e) => setTag(e.target.value)} />
        </label>
        <button
          onClick={() =>
            safely(() => {
              if (!registry.tags.has(tag)) throw Error('标签尚未在内容包声明');
              commit({
                ...game,
                state: {
                  ...game.state,
                  tags: [...new Set([...game.state.tags, tag])],
                },
              });
            })
          }
        >
          添加
        </button>
        <button
          onClick={() =>
            commit({
              ...game,
              state: {
                ...game.state,
                tags: game.state.tags.filter((t) => t !== tag),
              },
            })
          }
        >
          移除
        </button>
      </div>
      <div className="debug-stats">
        {(
          [
            'technical',
            'business',
            'network',
            'stress',
            'energy',
            'autonomyConflict',
            'ambitionPressure',
            'unresolvedProblemPressure',
          ] as Stat[]
        ).map((key) => (
          <label key={key}>
            {key}
            <input
              aria-label={key}
              type="number"
              value={game.state[key]}
              min={0}
              max={100}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n))
                  commit({
                    ...game,
                    state: {
                      ...game.state,
                      [key]: Math.max(0, Math.min(100, n)),
                    },
                  });
              }}
            />
          </label>
        ))}
      </div>
      <button
        className="secondary-action"
        onClick={() =>
          safely(() => {
            const r = createRegistry([...corePacks, testAlternatePack]);
            register(r);
            commit(
              advance(
                {
                  ...game,
                  state: {
                    ...game.state,
                    tags: [
                      ...new Set([...game.state.tags, 'test_pack_enabled']),
                    ],
                  },
                },
                r,
              ),
            );
          })
        }
      >
        注册测试包并重新调度
      </button>
      <p className="muted">
        测试包要求：已到宾大之后，年份 1995—1999；条件不足时可先用上方工具设置。
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <h3>候选事件与未触发原因</h3>
      <div className="debug-candidates">
        {candidates.map((c) => (
          <div key={c.event.id} className="debug-candidate">
            <div>
              <strong>{c.event.title}</strong>
              <code>
                {c.event.id} · {c.pool} · 得分 {c.score.toFixed(2)} · 优先级{' '}
                {c.event.priority}
              </code>
              <small>
                {c.reasons.length ? c.reasons.join('；') : '可触发'}
              </small>
            </div>
            <button
              onClick={() =>
                commit({
                  ...game,
                  currentEventId: c.event.id,
                  phase: 'choice',
                  endingId: null,
                  pendingEventId: undefined,
                })
              }
            >
              强制进入
            </button>
          </div>
        ))}
      </div>
      <h3>选择适配与结果权重</h3>
      {current?.choices.map((c) => (
        <p key={c.id}>
          {c.text}
          <code>
            {calculateChoiceFit(c, game.state).label} /{' '}
            {calculateChoiceFit(c, game.state).score.toFixed(1)} · 权重 [
            {outcomeWeights(c, game.state)
              .map((w) => w.toFixed(1))
              .join(', ')}
            ]
          </code>
        </p>
      ))}
      <h3>已注册内容包</h3>
      <pre>{JSON.stringify(registry.versions, null, 2)}</pre>
      <h3>人格与价值模型</h3>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
      <h3>状态、标签与随机记录</h3>
      <pre>{JSON.stringify(game, null, 2)}</pre>
      <h3>结局调试</h3>
      <div className="debug-row">
        {registry.endings.map((e) => (
          <button
            key={e.id}
            onClick={() =>
              commit({
                ...game,
                phase: 'ending',
                endingId: e.id,
                currentEventId: null,
              })
            }
          >
            {e.title}
          </button>
        ))}
      </div>
    </div>
  );
}
