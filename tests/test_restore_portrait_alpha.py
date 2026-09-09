"""透明恢复的离线测试，不生成或替代任何游戏人物表情。"""
import importlib.util
import inspect
from pathlib import Path
import tempfile
import unittest
from PIL import Image, ImageDraw


class RestorePortraitAlphaTests(unittest.TestCase):
    def module(self):
        path = Path(__file__).resolve().parents[1] / 'scripts/restore_portrait_alpha.py'
        self.assertTrue(path.is_file(), '尚未实现透明蒙版恢复工具')
        spec = importlib.util.spec_from_file_location('restore_portrait_alpha', path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def fixture(self, directory):
        source = Path(directory) / 'expression.png'
        master = Path(directory) / 'master.png'
        output = Path(directory) / 'output.png'
        Image.new('RGB', (4, 4), (83, 51, 27)).save(source)
        image = Image.new('RGBA', (4, 4), (13, 15, 16, 0))
        image.putpixel((1, 1), (13, 15, 16, 128))
        image.putpixel((2, 2), (13, 15, 16, 254))
        image.save(master)
        return source, master, output

    def test_only_alpha_changes_and_sources_are_preserved(self):
        module = self.module()
        with tempfile.TemporaryDirectory() as directory:
            source, master, output = self.fixture(directory)
            originals = [source.read_bytes(), master.read_bytes()]
            module.restore(source, master, output)
            with Image.open(source) as before, Image.open(master) as reference, Image.open(output) as after:
                self.assertEqual(after.mode, 'RGBA')
                self.assertEqual(after.size, before.size)
                self.assertEqual(after.convert('RGB').tobytes(), before.tobytes())
                self.assertEqual(after.getchannel('A').tobytes(), reference.getchannel('A').tobytes())
            self.assertEqual(originals, [source.read_bytes(), master.read_bytes()])

    def test_rejects_dimension_mismatch(self):
        module = self.module()
        with tempfile.TemporaryDirectory() as directory:
            source, master, output = self.fixture(directory)
            Image.new('RGB', (5, 4)).save(source)
            with self.assertRaisesRegex(ValueError, '尺寸'):
                module.restore(source, master, output)
            self.assertFalse(output.exists())

    def test_rejects_opaque_reference(self):
        module = self.module()
        with tempfile.TemporaryDirectory() as directory:
            source, master, output = self.fixture(directory)
            Image.new('RGBA', (4, 4), (1, 2, 3, 255)).save(master)
            with self.assertRaisesRegex(ValueError, '透明'):
                module.restore(source, master, output)
            self.assertFalse(output.exists())

    def test_refuses_to_overwrite_existing_file(self):
        module = self.module()
        with tempfile.TemporaryDirectory() as directory:
            source, master, output = self.fixture(directory)
            original = source.read_bytes()
            with self.assertRaises(FileExistsError):
                module.restore(source, master, source)
            self.assertEqual(source.read_bytes(), original)

    def test_optional_edge_inset_only_changes_alpha(self):
        module = self.module()
        self.assertIn('inset', inspect.signature(module.restore).parameters)
        with tempfile.TemporaryDirectory() as directory:
            source, master, output = self.fixture(directory)
            module.restore(source, master, output, inset=1)
            with Image.open(source) as before, Image.open(output) as after:
                self.assertEqual(before.tobytes(), after.convert('RGB').tobytes())
                self.assertEqual(after.getchannel('A').getextrema(), (0, 0))

    def test_fringe_cleanup_preserves_interior_white_and_all_rgb(self):
        module = self.module()
        self.assertIn('clean_fringe', inspect.signature(module.restore).parameters)
        with tempfile.TemporaryDirectory() as directory:
            source, master, output = self.fixture(directory)
            expression = Image.new('RGB', (61, 61), (120, 80, 35))
            expression.putpixel((5, 30), (220, 220, 220))
            expression.putpixel((30, 30), (255, 255, 255))
            expression.save(source)
            reference = Image.new('RGBA', (61, 61), (0, 0, 0, 0))
            ImageDraw.Draw(reference).rectangle((5, 5, 55, 55), fill=(1, 2, 3, 254))
            reference.save(master)
            module.restore(source, master, output, clean_fringe=True)
            with Image.open(output) as result:
                self.assertEqual(result.getpixel((5, 30))[3], 0)
                self.assertEqual(result.getpixel((30, 30))[3], 254)
                self.assertEqual(result.getpixel((6, 30))[3], 254)
                self.assertEqual(result.convert('RGB').tobytes(), expression.tobytes())

    def test_production_combination_keeps_visible_center(self):
        module = self.module()
        with tempfile.TemporaryDirectory() as directory:
            source, master, output = self.fixture(directory)
            expression = Image.new('RGB', (61, 61), (120, 80, 35))
            expression.save(source)
            reference = Image.new('RGBA', (61, 61), (0, 0, 0, 0))
            ImageDraw.Draw(reference).rectangle((5, 5, 55, 55), fill=(1, 2, 3, 254))
            reference.save(master)
            module.restore(source, master, output, inset=2, clean_fringe=True)
            with Image.open(output) as result:
                self.assertEqual(result.getpixel((5, 30))[3], 0)
                self.assertEqual(result.getpixel((30, 30))[3], 254)
                self.assertEqual(result.convert('RGB').tobytes(), expression.tobytes())


if __name__ == '__main__':
    unittest.main()
