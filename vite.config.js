import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    plugins: [sveltekit()],
    build: {
      outDir: 'build',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Single file output for better caching
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash][extname]',
          // Keep modules together for better caching
          manualChunks: undefined,
          // Inline dynamic imports for better performance
          inlineDynamicImports: true
        }
      },
      // Disable CSS code splitting for better loading
      cssCodeSplit: false,
      // Inline assets smaller than 4KB
      assetsInlineLimit: 4096,
      // Generate sourcemaps only in development
      sourcemap: mode === 'development',
      minify: 'esbuild'
    },
    server: {
      port: 3000,
      strictPort: true,
      hmr: {
        host: 'harmonia-ui-production-243e.up.railway.app',
        protocol: 'wss',
        clientPort: 443
      }
    },
    preview: {
      host: true,
      port: 3000,
      strictPort: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'harmonia-ui-production-243e.up.railway.app'
      ]
    },
    base: './'
  };
});
