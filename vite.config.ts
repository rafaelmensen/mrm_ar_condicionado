// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: { port: 5173 }
// })


// // vite.config.ts
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   base: '/mrm_ar_condicionado/', // << IMPORTANTE
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/mrm_ar_condicionado/',  // nome exato do repo
  plugins: [react()],
});


