import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/socket.io': {
        target: process.env.VITE_API_URL,
        ws: true
      }
    }
  }
});
