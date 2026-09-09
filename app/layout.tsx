import type { Metadata } from 'next';
import { assetUrl } from '../src/game/assets';
import './globals.css';
export const metadata: Metadata = {
  icons: { icon: assetUrl('/favicon.svg')! },
  title: '马斯克传：平行人生',
  description:
    '一部可以被你改写的互动传记。从一枚闪烁的光标，走向未曾发生的人生。',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
