import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // SPA fallback for client-side routing
      fallback: 'index.html',
      // Output directory
      pages: 'build',
      assets: 'build',
      // Precompress for better performance
      precompress: true,
      // Enable strict mode
      strict: true
    }),
    // Prerender all pages by default
    prerender: {
      entries: ['*', '/attunement', '/coherence-field']
    },
    // Set the base path for deployment (empty for root domain, or '/repo-name' for GitHub Pages)
    paths: {
      base: process.env.NODE_ENV === 'production' ? '' : ''
    }
  },
  preprocess: vitePreprocess()
};

export default config;
