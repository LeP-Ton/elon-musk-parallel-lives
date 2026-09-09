type ClockCallbacks = {
  isCurrent: () => boolean;
  onRemaining: (milliseconds: number) => void;
  onElapsed: () => void;
  onError: (error: unknown) => void;
};

/** 一次性页面时钟；暂停、接管和卸载都取消同一个句柄，过期回调不能推进。 */
export function startPlaybackClock(delay: number, callbacks: ClockCallbacks) {
  if (!Number.isFinite(delay) || delay <= 0)
    throw new Error('播放间隔必须大于零。');
  const deadline = performance.now() + delay;
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    clearInterval(timer);
  };
  const timer = setInterval(() => {
    if (cancelled) return;
    try {
      if (!callbacks.isCurrent()) return cancel();
      const remaining = Math.max(0, deadline - performance.now());
      callbacks.onRemaining(remaining);
      if (remaining === 0 && !cancelled && callbacks.isCurrent()) {
        cancel();
        callbacks.onElapsed();
      }
    } catch (error) {
      cancel();
      callbacks.onError(error);
    }
  }, 200);
  return cancel;
}
