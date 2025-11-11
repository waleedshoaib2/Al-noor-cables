import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist-electron',
    emptyOutDir: true,
    target: 'node18',
    minify: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'main.ts'),
        preload: resolve(__dirname, 'preload.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'cjs', // Use CommonJS for both - works with Electron
      },
      external: [
        'electron',
        'path',
        'url',
        'fs',
        'os',
        'crypto',
        'stream',
        'util',
        'events',
        'buffer',
        'process',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
