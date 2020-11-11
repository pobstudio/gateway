import Analytics from 'analytics';
import mixpanelPlugin from '@analytics/mixpanel';
import { MIXPANEL_KEY } from './constants';
import { isBrowser } from './utils';

const mplugin = mixpanelPlugin({
  token: MIXPANEL_KEY,
  enabled: isBrowser() && window?.location?.hostname?.includes('pob.studio'),
});

export const analytics = Analytics({
  app: 'POB-app',
  plugins: [mplugin],
});
