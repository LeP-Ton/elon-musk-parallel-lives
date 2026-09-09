import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Game, Registry } from '../game/types';
import {
  readingDelay,
  selectAutomaticChoice,
  stepAutomatically,
  type PlaybackSpeed,
} from '../engine/autoplay';
import { startPlaybackClock } from '../game/autoplay-clock';

type PlaybackInput = {
  game: Game;
  registry: Registry;
  blocked: boolean;
  onStep: (next: Game) => void;
  onError: (error: unknown) => void;
};

export function useAutoplay(input: PlaybackInput) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [remaining, setRemaining] = useState(0);
  const current = useRef(input);
  const playingRef = useRef(false);
  const cancelRef = useRef<() => void>(() => {});
  // 只发布已提交的快照；并发渲染若被丢弃，时钟不能使用未提交的人生状态。
  useLayoutEffect(() => {
    current.current = input;
  });
  const { game, registry, blocked } = input;
  const plan = useMemo(() => {
    try {
      return { choice: selectAutomaticChoice(game, registry), error: null };
    } catch (error) {
      return { choice: null, error };
    }
  }, [game, registry]);

  function pause() {
    // 同步失效，不能等 React 下一次渲染后才取消已排队的自动动作。
    playingRef.current = false;
    cancelRef.current();
    setPlaying(false);
    setRemaining(0);
  }
  function start() {
    // 开新人生和关闭面板可能与启动同批提交，合法性由下一次 effect 的新快照检查。
    playingRef.current = true;
    setPlaying(true);
  }
  function changeSpeed(next: PlaybackSpeed) {
    if (![1, 2, 4].includes(next) || next === speed) return;
    cancelRef.current();
    setSpeed(next);
  }
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      playingRef.current = false;
      cancelRef.current();
    };
  }, []);
  // 此 effect 管理外部时钟，同时初始化倒计时和同步停止态，不能等待首次 tick 才阻止过期动作。
  /* eslint-disable react/react-compiler */
  useEffect(() => {
    if (!playing) return;
    if (blocked || game.phase === 'ending' || document.hidden) {
      pause();
      return;
    }
    try {
      if (plan.error) throw plan.error;
      const duration = readingDelay(game, registry, speed);
      setRemaining(duration);
      cancelRef.current = startPlaybackClock(duration, {
        isCurrent: () =>
          playingRef.current &&
          !document.hidden &&
          !current.current.blocked &&
          current.current.game === game &&
          current.current.registry === registry,
        onRemaining: setRemaining,
        onElapsed: () =>
          current.current.onStep(stepAutomatically(game, registry)),
        onError: (error) => {
          pause();
          current.current.onError(error);
        },
      });
      return () => cancelRef.current();
    } catch (error) {
      pause();
      current.current.onError(error);
    }
  }, [game, registry, blocked, playing, speed, plan]);
  /* eslint-enable react/react-compiler */
  return {
    playing,
    speed,
    remaining,
    plannedChoice: playing ? plan.choice : null,
    start,
    pause,
    changeSpeed,
  };
}
