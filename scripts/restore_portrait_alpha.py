"""经用户授权的离线抠图：沿用同姿势母版的透明度，不修改表情图的RGB。

仅适合同人物、同画布、同轮廓的参考编辑结果。每批仍须检查头发/肩部边缘，
不能将蒙版自动套用视为视觉验收通过。依赖Python与Pillow，不参与网站运行。
"""
import argparse
from pathlib import Path
from PIL import Image, ImageFilter, ImageChops


def restore(source: Path, master: Path, output: Path, inset: int = 0, clean_fringe: bool = False) -> None:
    """非破坏式写入新PNG；任何已存在的输出（包括原图）均拒绝覆盖。"""
    source, master, output = Path(source), Path(master), Path(output)
    if output.exists():
        raise FileExistsError(f'拒绝覆盖已有文件：{output}')
    if inset not in range(4):
        raise ValueError('边缘内缩仅允许0至3像素，不能大幅裁去人物')
    with Image.open(source) as expression, Image.open(master) as reference:
        if expression.size != reference.size:
            raise ValueError('表情图与母版尺寸不同，需人工确认轮廓，不能自动缩放')
        if 'A' not in reference.getbands():
            raise ValueError('母版没有真实透明通道')
        alpha = reference.getchannel('A')
        low, high = alpha.getextrema()
        if low != 0 or high < 200:
            raise ValueError('母版必须同时含有透明背景和可见人物')
        if inset:
            # 生成图轮廓附近可能混入棋盘底色；仅轻收蒙版，不改RGB或表情。
            alpha = alpha.filter(ImageFilter.MinFilter(inset * 2 + 1))
        if clean_fringe:
            # 仅识别轮廓12像素内的亮灰棋盘污染；内部白色衣物受核心蒙版保护。
            r, g, b = expression.convert('RGB').split()
            minimum = ImageChops.darker(ImageChops.darker(r, g), b)
            maximum = ImageChops.lighter(ImageChops.lighter(r, g), b)
            gray = ImageChops.subtract(maximum, minimum).point(lambda v: 255 if v < 24 else 0)
            bright = minimum.point(lambda v: 255 if v >= 185 else 0)
            edge = alpha.filter(ImageFilter.MinFilter(25)).point(lambda v: 255 if v < 200 else 0)
            alpha = ImageChops.subtract(alpha, ImageChops.multiply(edge, ImageChops.multiply(gray, bright)))
        result = expression.convert('RGBA')
        result.putalpha(alpha)
        # xb同时保护重复运行和输出路径误填，绝不写回源文件。
        with output.open('xb') as target:
            result.save(target, format='PNG')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--master', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--inset', type=int, default=0, choices=range(4))
    parser.add_argument('--clean-fringe', action='store_true')
    args = parser.parse_args()
    restore(args.source, args.master, args.output, args.inset, args.clean_fringe)
    print(f'已恢复透明蒙版，RGB未修改：{args.output}')
