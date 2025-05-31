import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       // Copia las fuentes de Bootstrap Icons a la carpeta dist/assets/fonts
    //       src: 'electron/db/patients.db',
    //       dest: 'dist-electron',
    //     },
        
    //   ],
    // }),
    electron({
      main: {
        entry: 'electron/main.js',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'electron', 
                'path', 
                'fs', 
                'os',
              ],
              // plugins: [
              //   commonjs({
              //     ignoreDynamicRequires: true,
              //   }),
              // ],
            }
          }
        }
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.js'),
      },
      renderer: process.env.NODE_ENV === 'test'
        ? undefined
        : {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
