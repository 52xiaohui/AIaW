import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'cn.outm.aiaw',
  appName: 'AIaW',
  webDir: 'dist/spa',
  plugins: {
    EdgeToEdge: {
      backgroundColor: '#00ffffff'
    },
    Keyboard: {
      resizeOnFullScreen: true
    }
  }
}

export default config
