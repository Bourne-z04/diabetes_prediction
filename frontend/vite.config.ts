import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0', // 允许局域网和公网访问
    allowedHosts: [
      'ri108619vw885.vicp.fun', // 允许穿透工具的域名
      // 可选：允许其他域名或 IP（如局域网地址）
      // "localhost",
      // "192.168.x.x"
    ],
    // 其他配置...
  },
})
