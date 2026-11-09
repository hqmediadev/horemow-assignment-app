import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/@firebase/firestore/')) return 'firebase-firestore';
          if (id.includes('/node_modules/@firebase/auth/')) return 'firebase-auth';
          if (id.includes('/node_modules/@firebase/app/')) return 'firebase-app';
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'testimony.horemow.com',
      'da.horemow.com',
      '.horemow.com' // Whitelists all subdomains under horemow.com automatically
    ]
  }
});
