export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  backgroundColor?: string;
  plugins?: Record<string, any>;
  server?: {
    androidScheme?: string;
    cleartext?: boolean;
    url?: string;
  };
}

const config: CapacitorConfig = {
  appId: 'com.chubuk.catharsismatrix',
  appName: 'Catharsis Matrix',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#050a14',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#050a14',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#050a14'
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
