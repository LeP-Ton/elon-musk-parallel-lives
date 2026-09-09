import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
// 本作存档明确只保存在设备上，静态导出无需服务器数据库。
export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [vinext()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: { useFsEvents: false, usePolling: true },
  },
});
