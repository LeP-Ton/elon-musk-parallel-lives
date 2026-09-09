import type { SourceRef } from '../game/types';
export const sources: SourceRef[] = [
  {
    id: 'pbs-2021',
    title: 'PBS · In Their Own Words: Elon Musk',
    type: 'interview',
    year: 2021,
    url: 'https://www.pbs.org/video/elon-musk-4r4s3a/',
    note: '纪录片采访与讲述支持童年接触计算机、编写 Blastar 并出售的事件。游戏卧室、对白与投稿过程为原创戏剧化，编写与发表年份并非同一概念。',
  },
  {
    id: 'queens-2013',
    title: 'Queen’s Alumni Review · Rocket man',
    type: 'interview',
    year: 2013,
    url: 'https://www.queensu.ca/alumnireview/articles/2013-02-01/elon-musk',
    note: '校友访谈支持南非成长、赴加拿大、Queen’s 和转学经历。该文关于就读年份存在内部不一致，本作以约 1990 年入学呈现，不声称具体场景日期是史实。',
  },
  {
    id: 'wharton-2009',
    title: 'Knowledge at Wharton · Harnessing the Sun and Outer Space',
    type: 'official',
    year: 2009,
    url: 'https://knowledge.wharton.upenn.edu/article/harnessing-the-sun-and-outer-space-elon-musks-sky-high-vision/',
    note: '支持 Penn 物理与商业学习、1995 年离校与 1997 年正式获得学位的区分，以及 Zip2 于 1999 年出售。游戏不把 1995 年写作正式授予学位之年。',
  },
  {
    id: 'stanford-2003',
    title: 'Stanford eCorner · History of Zip2',
    type: 'interview',
    year: 2003,
    url: 'https://ecorner.stanford.edu/wp-content/uploads/sites/2/2003/10/397.pdf',
    note: '马斯克回顾 Zip2 创业的一手演讲；具体商户、演示、签约、失败分支均为原创推演。',
  },
  {
    id: 'stanford-2015',
    title: 'Stanford eCorner · Switching from Scholar to Entrepreneur',
    type: 'interview',
    year: 2015,
    url: 'https://ecorner.stanford.edu/wp-content/uploads/sites/2/2015/10/3622.pdf',
    note: '本人回顾从博士计划转向互联网创业。以“博士计划”表述，避免把注册、延期与退学争议写成无争议事实。Netscape 录用路线完全是假设。',
  },
];
