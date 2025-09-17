import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //additional added
  optimizeDeps: {
    include: ['monaco-editor/esm/vs/basic-languages/python/python.contribution', 'monaco-editor/esm/vs/basic-languages/java/java.contribution']
  }
})
