import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    const env = loadEnv(mode,'./')
    return {
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
            port: env.VITE_PORT,
            proxy: {
                '/api': {
                    target:env.VITE_BACKEND_URL,
                    // 解决跨域问题
                    changeOrigin: true,
                }
            }
        },
        base: './',
        // 如果需要，可以配置其他选项
    }
});
