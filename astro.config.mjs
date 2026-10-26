import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/uploads': {
          target: 'https://student-placement-portal-uzqi.onrender.com',
          changeOrigin: true,
        },
      },
    },
  },
});
