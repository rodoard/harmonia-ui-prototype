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
      host: '0.0.0.0', 
      allowedHosts:['https://harmonia-ui-production-c554.up.railway.app']
    },
    preview: {
      host: '0.0.0.0', 
      allowedHosts: [
        'https://harmonia-ui-production-c554.up.railway.app'
      ]
    },
    base: './'
  };
});
