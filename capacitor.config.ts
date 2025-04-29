import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'cn.outm.aiaw',
  appName: 'AIaW',
  webDir: 'dist/spa',
  server: {
    url: 'http://192.168.0.100:9005', // 替换为你的本地IP
    cleartext: true
  },
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
