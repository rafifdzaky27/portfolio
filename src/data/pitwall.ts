// Screenshots of Pit Wall On-Call come in the game's light and dark themes.
// The site shows the set that matches its own theme (.only-dark / .only-light).
import monitoringLight from '../assets/pitwall/monitoring-light.png';
import monitoringDark from '../assets/pitwall/monitoring-dark.png';
import cafe from '../assets/pitwall/cafe.png';

export const pitwallTheme: 'light' | 'dark' = 'dark';

export const pitwallShots = {
  light: {
    monitoring: monitoringLight,
    monitoringAlt: 'The Monitoring app during a full disk: three alerts including NodeDiskFull, a service map with edge-gateway and checkout-api critical, a 5xx rate of 34.9 percent, and checkout 500 errors in the log stream',
    monitoringCaption: 'Monitoring during a full disk. Checkout fails because /var/log filled up on one API node.',
  },
  dark: {
    monitoring: monitoringDark,
    monitoringAlt: 'The Monitoring app during CPU saturation: three alerts, a service map with edge-gateway and search-api critical, a 5xx rate of 17.3 percent, and upstream timeouts in the log stream',
    monitoringCaption: 'Monitoring during CPU saturation. Search times out because one regex pins the search API at full CPU.',
  },
};

export const pitwall = { cafe, ...pitwallShots[pitwallTheme] };
