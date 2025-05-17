import * as Analytics from 'expo-firebase-analytics';

export const logAppOpen = async () => {
  await Analytics.logEvent('app_open', {
    timestamp: new Date().toISOString()
  });
};

export const logScreenView = async (screenName: string) => {
  await Analytics.logEvent('screen_view', {
    screen: screenName,
    timestamp: new Date().toISOString()
  });
};
