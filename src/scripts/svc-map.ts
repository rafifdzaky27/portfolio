// Draws PitOS service-map edges (console.css .edge) between node boxes.
// Markup: <div class="svc-map" data-edges="a>b,b>c:auto"><svg class="svc-edges"/>
//   <ol class="svc-nodes"><li class="svc-node" data-id="a">…</li>…</ol></div>
// An optional ":kind" suffix (auto, gate) styles the edge.
function draw(map: HTMLElement) {
  const svg = map.querySelector('.svc-edges');
  if (!svg) return;
  const box = map.getBoundingClientRect();
  let out = '';
  for (const spec of (map.dataset.edges || '').split(',')) {
    if (!spec) continue;
    const [pair, kind = ''] = spec.split(':');
    const [from, to] = pair.split('>');
    const a = map.querySelector(`[data-id="${from}"]`);
    const b = map.querySelector(`[data-id="${to}"]`);
    if (!a || !b) continue;
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const ax = ra.left + ra.width / 2 - box.left;
    const ay = ra.top + ra.height / 2 - box.top;
    const bx = rb.left + rb.width / 2 - box.left;
    const by = rb.top + rb.height / 2 - box.top;
    const sameRow = Math.abs(ay - by) < 4;
    const sameCol = Math.abs(ax - bx) < 4;
    let d: string;
    if (rb.left >= ra.right - 1) {
      const x1 = ra.right - box.left;
      const x2 = rb.left - box.left;
      const mx = (x1 + x2) / 2;
      d = sameRow ? `M${x1} ${ay}H${x2}` : `M${x1} ${ay}H${mx}V${by}H${x2}`;
    } else {
      const y1 = ra.bottom - box.top;
      const y2 = rb.top - box.top;
      const my = (y1 + y2) / 2;
      d = sameCol ? `M${ax} ${y1}V${y2}` : `M${ax} ${y1}V${my}H${bx}V${y2}`;
    }
    out += `<path class="svc-edge ${kind}" d="${d}"/>`;
  }
  svg.innerHTML = out;
}

export function initServiceMaps() {
  const maps = [...document.querySelectorAll<HTMLElement>('.svc-map[data-edges]')];
  if (!maps.length) return;
  const all = () => maps.forEach(draw);
  all();
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(all);
    maps.forEach((m) => ro.observe(m));
  }
  document.fonts?.ready.then(all);
  window.addEventListener('load', all);
}
