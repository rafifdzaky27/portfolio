// Screenshots of Pit Wall On-Call come in the game's light and dark themes.
// The site shows the set that matches its own theme (.only-dark / .only-light).
import monitoringLight from '../assets/pitwall/monitoring-light.png';
import monitoringDark from '../assets/pitwall/monitoring-dark.png';
import desktopLight from '../assets/pitwall/desktop-light.png';
import desktopDark from '../assets/pitwall/desktop-dark.png';
import cafe from '../assets/pitwall/cafe.png';

export const pitwallTheme: 'light' | 'dark' = 'dark';

export const pitwallShots = {
  light: {
    monitoring: monitoringLight,
    monitoringAlt: 'The Monitoring app during a retry storm: two alerts, a service map with edge-gateway and checkout-api critical, a 5xx rate of 44 percent, and gateway timeout errors in the log stream',
    monitoringCaption: 'Monitoring during a retry storm. The gateway is failing, but the cause is further down the chain.',
    desktop: desktopLight,
  },
  dark: {
    monitoring: monitoringDark,
    monitoringAlt: 'The Monitoring app during replica lag: three alerts, a service map with the gateway, accounts-api and a read replica critical, and 502 errors in the log stream',
    monitoringCaption: 'Monitoring during replica lag. Order history fails because the read replica is behind the primary.',
    desktop: desktopDark,
  },
};

export const pitwall = { cafe, ...pitwallShots[pitwallTheme] };
