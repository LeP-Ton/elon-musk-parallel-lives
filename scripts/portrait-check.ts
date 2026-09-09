import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { inflateSync } from 'node:zlib';

/** 只读检查生成资源：透明通道与实际像素，不把棋盘背景误认成透明。 */
export function inspectPortrait(png: Uint8Array) {
  if (
    png.length < 8 ||
    ![137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => png[i] === b)
  )
    throw new Error('不是 PNG 文件');
  let width = 0,
    height = 0;
  const data: Uint8Array[] = [];
  const uint32 = (bytes: Uint8Array, offset: number) =>
    new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(
      offset,
    );
  for (let offset = 8; offset + 12 <= png.length;) {
    const length = uint32(png, offset);
    const type = new TextDecoder().decode(png.subarray(offset + 4, offset + 8));
    const body = png.subarray(offset + 8, offset + 8 + length);
    if (body.length !== length) throw new Error('PNG 数据被截断');
    if (type === 'IHDR') {
      width = uint32(body, 0);
      height = uint32(body, 4);
      if (body[8] !== 8 || body[9] !== 6 || body[12] !== 0)
        throw new Error('立绘必须为 8 位 RGBA、非隔行 PNG，不能使用烘焙背景');
    }
    if (type === 'IDAT') data.push(body);
    offset += length + 12;
  }
  if (!width || !height || width * height > 16000000)
    throw new Error('立绘尺寸不合法');
  const raw = inflateSync(Buffer.concat(data));
  const stride = width * 4;
  if (raw.length !== (stride + 1) * height) throw new Error('PNG 像素长度异常');
  const pixels = Buffer.alloc(stride * height);
  const paeth = (a: number, b: number, c: number) => {
    const p = a + b - c;
    const da = Math.abs(p - a),
      db = Math.abs(p - b),
      dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    if (filter > 4) throw new Error('PNG 滤波类型异常');
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x;
      const a = x >= 4 ? pixels[i - 4] : 0;
      const b = y ? pixels[i - stride] : 0;
      const c = y && x >= 4 ? pixels[i - stride - 4] : 0;
      const prediction = [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][
        filter
      ];
      pixels[i] = (raw[y * (stride + 1) + x + 1] + prediction) & 255;
    }
  }
  let transparent = 0,
    visible = 0;
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) {
      transparent++;
      // 隐藏 RGB 不影响视觉；归零后再查重，避免只改透明区骗过检查。
      pixels[i - 3] = pixels[i - 2] = pixels[i - 1] = 0;
    }
    if (pixels[i] > 200) visible++;
  }
  if (transparent < width * height * 0.1 || visible < width * height * 0.1)
    throw new Error('透明背景或可见人物不足，需人工检查素材');
  return {
    width,
    height,
    transparent,
    visible,
    pixelHash: createHash('sha256').update(pixels).digest('hex'),
  };
}
