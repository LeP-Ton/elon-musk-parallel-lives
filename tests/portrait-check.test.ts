import { describe, expect, it } from 'vitest';
import { Buffer } from 'node:buffer';
import { deflateSync } from 'node:zlib';
import { inspectPortrait } from '../scripts/portrait-check';

// 仅构造内存中的两像素检查夹具；不制作或修改游戏人物图片。
function fixture(alpha: number[], hidden = 0, filter = 0, colorType = 6) {
  const chunk = (type: string, data: Buffer) => {
    const result = Buffer.alloc(data.length + 12);
    result.writeUInt32BE(data.length);
    result.write(type, 4);
    result.set(data, 8);
    return result;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(2);
  header.writeUInt32BE(1, 4);
  header[8] = 8;
  header[9] = colorType;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk(
      'IDAT',
      deflateSync(
        Buffer.from([filter, hidden, 0, 0, alpha[0], 20, 30, 40, alpha[1]]),
      ),
    ),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
describe('人物素材只读校验', () => {
  it('识别真正的透明背景', () => {
    expect(inspectPortrait(fixture([0, 254]))).toMatchObject({
      width: 2,
      height: 1,
      transparent: 1,
      visible: 1,
    });
  });
  it('拒绝 RGB 棋盘背景和全不透明立绘', () => {
    expect(() => inspectPortrait(fixture([0, 255], 0, 0, 2))).toThrow('RGBA');
    expect(() => inspectPortrait(fixture([255, 255]))).toThrow('透明背景');
  });
  it('忽略透明区域的隐藏颜色并比较可见像素', () => {
    expect(inspectPortrait(fixture([0, 255], 0)).pixelHash).toBe(
      inspectPortrait(fixture([0, 255], 99)).pixelHash,
    );
  });
  it('拒绝无效格式与滤波数据', () => {
    expect(() => inspectPortrait(Buffer.from('fake'))).toThrow('PNG');
    expect(() => inspectPortrait(fixture([0, 255], 0, 5))).toThrow('滤波');
  });
});
