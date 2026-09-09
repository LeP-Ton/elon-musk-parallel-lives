/** 为公开资源补上部署路径；内容包始终保留与平台无关的资源地址。 */
export function assetUrl(
  path: string | undefined,
  basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '',
): string | undefined {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;
  return `${basePath.replace(/\/$/, '')}${path}`;
}
