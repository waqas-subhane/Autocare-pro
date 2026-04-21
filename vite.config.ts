import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // Use process.cwd() for better reliability
  
  return {
    // This matches your GitHub repository name
    base: mode === 'production' ? '/Autocare-pro/' : '/',

    plugins: [react(), tailwindcss()],
    
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        // Keep Vite aligned with tsconfig path alias ("@/*": ["./*"])
        '@': path.resolve(__dirname, './'),
      },
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },

    server: {
      // Standard HMR setup
      hmr: true,
    },
  };
});
