import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bb9ed831cfeb4f1183212ab9057fc46e',
  appName: 'eagleline',
  webDir: 'dist',
  plugins: {
    Geolocation: {
      permissions: ['geolocation']
    }
  }
};

export default config;
