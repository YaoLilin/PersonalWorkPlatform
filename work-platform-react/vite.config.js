import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'), // 将 @ 映射到 ./src
        },
    },
    // 配置服务代理
    server: {
        host: 'localhost',
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                // 解决跨域问题
                changeOrigin: true,
            }
        }
    },
    // 如果需要，可以配置其他选项
});
