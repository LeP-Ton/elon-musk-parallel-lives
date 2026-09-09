import type { ContentPack } from '../../game/types';
import { backgrounds, characters, portraits } from './characters';
import { buildScene } from './build';
import { chapterOne } from './chapter-one';
import { chapterTwo } from './chapter-two';
import { chapterThree } from './chapter-three';
import { chapterFour } from './chapter-four';
import { sources } from '../../research/sources';
import { chapterFive } from './chapter-five';
import { chapterSix, novelEndings } from './chapter-six';
import { interludes } from './interludes';
import type { Condition } from '../../game/types';
const insertions: Record<string, { when: Condition[]; next: string }> = {
  'letter-home': {
    when: [{ promise: 'letter', status: 'kept' }],
    next: 'echo-letter',
  },
  'credit-page': {
    when: [{ promise: 'credit', status: 'kept' }],
    next: 'echo-credit',
  },
  'founder-cash': {
    when: [{ promise: 'rest', status: 'pending' }],
    next: 'echo-rest',
  },
  'engineer-release': {
    when: [{ promise: 'privacy', status: 'pending' }],
    next: 'echo-privacy',
  },
  'games-contract': {
    when: [{ promise: 'license', status: 'kept' }],
    next: 'echo-license',
  },
  'research-results': {
    when: [{ promise: 'research', status: 'kept' }],
    next: 'echo-record',
  },
};
export const novelDrafts = [
  ...chapterOne,
  ...chapterTwo,
  ...chapterThree,
  ...chapterFour,
  ...chapterFive,
  ...chapterSix,
  ...interludes,
].map((d) =>
  insertions[d.id]
    ? {
        ...d,
        nextYear: undefined,
        routes: [insertions[d.id], ...(d.routes ?? [])],
      }
    : d,
);
const events = novelDrafts.map(buildScene);
export const novelPack: ContentPack = {
  id: 'early-visual-novel',
  version: '2.0.0',
  characters,
  assets: [...backgrounds, ...portraits],
  events,
  sources: sources.filter((s) =>
    ['wharton-2009', 'queens-2013'].includes(s.id),
  ),
  endings: novelEndings,
  tags: [
    ...new Set([
      ...events.flatMap((e) =>
        e.choices.flatMap((c) =>
          c.outcomes.flatMap((o) => [
            ...(o.addTags ?? []),
            ...(o.removeTags ?? []),
          ]),
        ),
      ),
      ...novelEndings.map((e) => `ending-${e.id}`),
    ]),
  ],
};
