import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL;

  return {
    plugins: [react()],
    define: {
      // Identifiant unique genere a chaque build, utilise par versionChecker.js
      // pour forcer le rechargement des onglets ouverts sur une ancienne version
      // (evite les erreurs "MIME type text/html" sur des chunks obsoletes apres deploiement).
      'import.meta.env.VITE_BUILD_ID': JSON.stringify(Date.now().toString()),
    },
    server: {
      port: 5174,
      host: true,
      open: true,
      allowedHosts: true, // Allow all hosts to avoid issues with tunnels
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        },
        '/storage': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Retirer les console.log en production
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          // Ajout de hash dans les noms de fichiers pour forcer le rafraîchissement du cache
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-thunk'],
            icons: ['@heroicons/react'],
          },
        },
      },
      // Augmenter la taille limite des chunks pour éviter les avertissements
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  }
})
