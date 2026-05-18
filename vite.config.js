import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import strip from '@rollup/plugin-strip'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      mode === 'production' && strip({
        include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
        functions: ['console.log', 'console.info'],
        debugger: true,
      })
    ].filter(Boolean),
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) {
                return 'supabase';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react-vendor';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  }
})

