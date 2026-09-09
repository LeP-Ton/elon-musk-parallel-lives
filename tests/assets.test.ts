import { describe, expect, it } from 'vitest';
import { assetUrl } from '../src/game/assets';

describe('双托管资源路径', () => {
  it('Sites 根路径不改变内容包地址', () => {
    expect(assetUrl('/assets/childhood.png', '')).toBe('/assets/childhood.png');
  });
  it('Pages 子目录应用到插画和网站图标', () => {
    expect(assetUrl('/assets/campus.png', '/elon-musk-parallel-lives')).toBe(
      '/elon-musk-parallel-lives/assets/campus.png',
    );
    expect(assetUrl('/favicon.svg', '/elon-musk-parallel-lives/')).toBe(
      '/elon-musk-parallel-lives/favicon.svg',
    );
  });
  it('不改写外部资源、相对地址或缺失的资源', () => {
    for (const value of [
      undefined,
      '',
      'assets/office.png',
      'https://example.com/a.png',
      '//example.com/a.png',
    ]) {
      expect(assetUrl(value, '/game')).toBe(value);
    }
  });
});
