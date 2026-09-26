// What Cloudflare's edge says about this request. /cdn-cgi/trace is served by
// Cloudflare on every proxied hostname, so it only exists in production.
// The visitor's IP is in the response too; it is never displayed or stored.

export interface Trace {
  edge: boolean;
  colo?: string;
  city?: string;
  loc?: string;
  http?: string;
  tls?: string;
  ttfb?: number;
}

// Cloudflare data centres a visitor from the region is likely to hit, plus the big ones.
const colos: Record<string, string> = {
  CGK: 'Jakarta', SUB: 'Surabaya', JOG: 'Yogyakarta', DPS: 'Denpasar', BTH: 'Batam', MDN: 'Medan',
  SIN: 'Singapore', KUL: 'Kuala Lumpur', JHB: 'Johor Bahru', BKK: 'Bangkok', MNL: 'Manila',
  SGN: 'Ho Chi Minh City', HAN: 'Hanoi', HKG: 'Hong Kong', TPE: 'Taipei', NRT: 'Tokyo', KIX: 'Osaka',
  ICN: 'Seoul', SYD: 'Sydney', MEL: 'Melbourne', PER: 'Perth', AKL: 'Auckland', BOM: 'Mumbai',
  DEL: 'New Delhi', MAA: 'Chennai', BLR: 'Bangalore', DXB: 'Dubai', LHR: 'London', AMS: 'Amsterdam',
  FRA: 'Frankfurt', CDG: 'Paris', MAD: 'Madrid', ARN: 'Stockholm', WAW: 'Warsaw', IAD: 'Ashburn',
  EWR: 'Newark', ORD: 'Chicago', DFW: 'Dallas', LAX: 'Los Angeles', SJC: 'San Jose', SEA: 'Seattle',
  YYZ: 'Toronto', GRU: 'São Paulo', JNB: 'Johannesburg',
};

const ttfb = () => {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!nav || !nav.responseStart || !nav.requestStart) return undefined;
  const ms = Math.round(nav.responseStart - nav.requestStart);
  return ms > 0 ? ms : undefined;
};

let pending: Promise<Trace> | undefined;

export const getTrace = () =>
  (pending ??= (async () => {
    const base: Trace = { edge: false, ttfb: ttfb() };
    try {
      const res = await fetch('/cdn-cgi/trace', { cache: 'no-store' });
      const text = res.ok ? await res.text() : '';
      if (!text.includes('colo=')) return base;
      const kv = Object.fromEntries(text.trim().split('\n').map((l) => l.split('=') as [string, string]));
      return {
        ...base,
        edge: true,
        colo: kv.colo,
        city: colos[kv.colo],
        loc: kv.loc,
        http: kv.http?.replace('http/', 'HTTP/'),
        tls: kv.tls?.replace('TLSv', 'TLS '),
      };
    } catch {
      return base;
    }
  })());

/** "2 h ago", "3 days ago" */
export const ago = (iso: string) => {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 90) return 'just now';
  const m = s / 60, h = m / 60, d = h / 24;
  if (m < 60) return `${Math.round(m)} min ago`;
  if (h < 36) return `${Math.round(h)} h ago`;
  return `${Math.round(d)} days ago`;
};
