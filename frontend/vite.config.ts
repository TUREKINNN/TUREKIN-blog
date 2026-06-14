import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    cssMinify: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
          helmet: ['react-helmet-async'],
          // 防止 AuthContext 在懒加载 chunk 中重复打包导致 Context 失联
          contexts: [
            './src/context/AuthContext.tsx',
            './src/context/ArticleContext.tsx',
            './src/context/ThemeContext.tsx',
            './src/context/ToastContext.tsx',
            './src/context/SearchFilterContext.tsx',
          ],
        },
      },
    },
  },
});