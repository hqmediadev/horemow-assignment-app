import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react()],
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
