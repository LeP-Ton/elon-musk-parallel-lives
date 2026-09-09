import type { NextConfig } from 'next';
// Sites 使用根路径，GitHub Pages 项目站点在构建时注入仓库路径。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  ...(basePath ? { trailingSlash: true } : {}),
};
export default nextConfig;
