import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist-electron',
    emptyOutDir: true,
    target: 'node18', // Target Node.js 18
    minify: false, // Don't minify for easier debugging
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'main.ts'),
        preload: resolve(__dirname, 'preload.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'es',
      },
      external: [
        'electron',
        // Node.js built-in modules should be externalized
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
  // Tell Vite this is a Node.js build
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
