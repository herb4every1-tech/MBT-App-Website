import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mbt.bloodanalysis',
  appName: 'MBT',
  webDir: 'dist',
  android: {
    allowMixedContent: true  // Required: app runs on https://localhost but API is on http://
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "165405084372-36tgk1c92qa1ara28i8cpqh8gf2vpdek.apps.googleusercontent.com",
      androidClientId: "165405084372-ekkiqhq285h45gta5advcusno2qpgpdl.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
