import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// 工作流取 Pages 实际路径；本地默认使用当前项目的仓库名。
const basePath = (
  process.env.GITHUB_PAGES_BASE_PATH ?? '/elon-musk-parallel-lives'
).replace(/\/$/, '');
assert(
  basePath === '' || /^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(basePath),
  'Pages 基础路径必须为空或不含相对跳转的绝对路径。',
);
const result = spawnSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'build'],
  {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath },
  },
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

// Vinext 把基础路径写入输出目录；Pages 本身已挂载在这个路径上，需移除一层。
// 只复制静态页面与 public 资源，绝不上传源码、服务器中间产物或环境文件。
const client = join(root, 'dist/client');
const exported = join(client, basePath.slice(1));
const output = join(root, 'dist/github-pages');
assert(existsSync(join(exported, 'index.html')), '构建缺少 Pages 首页。');
rmSync(output, { recursive: true, force: true });
cpSync(exported, output, { recursive: true });
cpSync(join(root, 'public'), output, { recursive: true });

// 防止部署后只有 HTML 可访问，而脚本、样式、图标或首幕插画出现 404。
const html = readFileSync(join(output, 'index.html'), 'utf8');
const prefix = `${basePath}/`;
let checked = 0;
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const url = match[1];
  if (!url.startsWith('/') || url.startsWith('//')) continue;
  assert(url.startsWith(prefix), `资源缺少 Pages 基础路径：${url}`);
  const relativePath = decodeURIComponent(
    url.slice(prefix.length).split(/[?#]/)[0],
  );
  assert(existsSync(join(output, relativePath)), `资源文件不存在：${url}`);
  checked += 1;
}
assert(checked > 0, '首页没有可校验的静态资源。');
assert(html.includes(`${prefix}assets/childhood.png`), '首幕插画路径不正确。');
console.log(
  `Pages 构建完成：${basePath || '/'}；${checked} 项首页资源引用通过校验。`,
);
