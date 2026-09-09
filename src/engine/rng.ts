export type RandomStream =
  | 'narrative'
  | 'outcome'
  | 'randomEvent'
  | 'company'
  | 'autoplay'
  | 'cosmetic';
/** 无共享游标：增删美术抽样不会消耗剧情随机数。 */
export function random(
  seed: string,
  stream: RandomStream,
  eventId: string,
  attempt = 0,
): number {
  const key = JSON.stringify([seed, stream, eventId, attempt]);
  let h = 2166136261;
  for (let i = 0; i < key.length; i++)
    h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  h += 0x6d2b79f5;
  let t = Math.imul(h ^ (h >>> 15), h | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function weightedIndex(weights: number[], roll: number): number {
  if (
    !weights.length ||
    weights.some((w) => !Number.isFinite(w) || w < 0) ||
    weights.every((w) => w === 0)
  )
    throw new Error('没有合法的结果权重');
  const target = roll * weights.reduce((a, b) => a + b, 0);
  let sum = 0;
  return weights.findIndex((weight, index) => {
    sum += weight;
    return target < sum || index === weights.length - 1;
  });
}
