import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: process.env.PORT || 3000,
		strictPort: true
	},
	preview: {
		port: process.env.PORT || 3000,
		strictPort: true
	}
});

