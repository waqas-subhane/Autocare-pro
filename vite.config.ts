import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // Use process.cwd() for better reliability
  
  return {
    // This matches your GitHub repository name
    base: '/Autocare-pro/', 

    plugins: [react(), tailwindcss()],
    
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        // Standard convention for '@' is to point to the 'src' directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      // Ensures the output directory is clean for GitHub Pages
      outDir: 'dist',
      assetsDir: 'assets',
    },

    server: {
      // Standard HMR setup
      hmr: true,
    },
  };
});
