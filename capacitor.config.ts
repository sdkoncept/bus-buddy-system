import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bb9ed831cfeb4f1183212ab9057fc46e',
  appName: 'eagleline',
  webDir: 'dist',
  // Hot-reload disabled for production - uncomment for development:
  // server: {
  //   url: "https://bb9ed831-cfeb-4f11-8321-2ab9057fc46e.lovableproject.com?forceHideBadge=true",
  //   cleartext: true
  // },
  plugins: {
    Geolocation: {
      permissions: ['geolocation']
    }
  }
};

export default config;
