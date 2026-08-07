import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'

// Derleme damgası: hangi commit'in pakete girdiği uygulamada görünür
// (Profil altı + BootLoader) — "güncelleme geldi mi?" tartışmasını bitirir.
let commit = 'bilinmiyor'
try { commit = execSync('git rev-parse --short HEAD').toString().trim() } catch { /* git yoksa */ }
const builtAt = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'

// Sürüm TEK KAYNAKTAN: package.json. Daha önce appUpdate.js'te elle yazılıydı
// ve 1.0.2 çıkışında güncellenmeyi unuttu — cihaz kendini 1.0.1 sanıp mevcut
// sürümde "güncelleme var" uyarısı gösterebiliyordu. Artık sapması imkânsız.
// Sürüm artışında yalnız package.json + iOS MARKETING_VERSION + Android
// versionName güncellenir (üçü aynı değer).
const appVersion = createRequire(import.meta.url)('./package.json').version

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_COMMIT__: JSON.stringify(commit),
    __APP_BUILT_AT__: JSON.stringify(builtAt),
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  build: {
    rollupOptions: {
      output: {
        // Ağır vendor'ları kendi chunk'larına ayır: ilk yük parse süresi düşer,
        // vendor değişmediğinde uygulama güncellemesinde yeniden indirilmez (cache).
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('leaflet')) return 'leaflet';
          if (id.includes('react-router') || id.includes('/react-dom/') || id.includes('/react/')) return 'react';
        },
      },
    },
  },
})
