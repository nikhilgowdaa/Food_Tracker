/* =====================================================================
   charts.js
   Lightweight canvas charts — no external libraries.
   Provides: lineChart, barChart, ringChart (progress circle).
   All read CSS variables so they respect dark/light mode.
   ===================================================================== */

const Charts = {
  _css(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  },

  _prep(canvas) {
    const ratio = window.devicePixelRatio || 1;
    // Cache the logical height ONCE — we mutate canvas.height below (×ratio),
    // so re-reading the attribute on later renders would compound the size.
    if (canvas._logicalH == null) canvas._logicalH = parseInt(canvas.getAttribute('height')) || 180;
    const h = canvas._logicalH;
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width) || canvas.clientWidth || 320;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, w, h };
  },

  /* ---- Progress ring (liver score / macros) ---- */
  ring(canvas, value, max, color, label, sub) {
    const { ctx, w, h } = this._prep(canvas);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 8;
    const pct = Math.max(0, Math.min(1, value / max));
    const track = this._css('--ring-track', 'rgba(120,120,128,0.18)');
    // track
    ctx.lineWidth = Math.max(6, Math.round(r * 0.26));
    ctx.lineCap = 'round';
    ctx.strokeStyle = track;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // value arc
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
    ctx.stroke();
    // center text
    ctx.fillStyle = this._css('--text', '#000');
    ctx.textAlign = 'center';
    ctx.font = '700 ' + Math.round(r * 0.5) + 'px -apple-system, system-ui, sans-serif';
    ctx.fillText(label, cx, cy + r * 0.08);
    if (sub) {
      ctx.fillStyle = this._css('--text-sub', '#888');
      ctx.font = '500 ' + Math.round(r * 0.18) + 'px -apple-system, system-ui, sans-serif';
      ctx.fillText(sub, cx, cy + r * 0.42);
    }
  },

  /* ---- Line chart ---- */
  line(canvas, labels, series, opts = {}) {
    const { ctx, w, h } = this._prep(canvas);
    ctx.clearRect(0, 0, w, h);
    const padL = 34, padR = 12, padT = 14, padB = 24;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const all = series.flatMap(s => s.data).filter(v => v != null);
    if (!all.length) { this._empty(ctx, w, h); return; }
    let min = Math.min(...all), max = Math.max(...all);
    if (opts.min != null) min = Math.min(min, opts.min);
    if (opts.max != null) max = Math.max(max, opts.max);
    if (min === max) { max += 1; min -= 1; }
    const grid = this._css('--ring-track', 'rgba(120,120,128,0.18)');
    const sub = this._css('--text-sub', '#888');

    // gridlines
    ctx.strokeStyle = grid; ctx.lineWidth = 1; ctx.fillStyle = sub;
    ctx.font = '10px -apple-system, system-ui, sans-serif'; ctx.textAlign = 'right';
    for (let i = 0; i <= 3; i++) {
      const y = padT + plotH * i / 3;
      const val = max - (max - min) * i / 3;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillText(Math.round(val), padL - 4, y + 3);
    }
    // x labels (sparse)
    ctx.textAlign = 'center';
    const step = Math.ceil(labels.length / 6);
    labels.forEach((lb, i) => {
      if (i % step !== 0 && i !== labels.length - 1) return;
      const x = padL + (labels.length === 1 ? plotW / 2 : plotW * i / (labels.length - 1));
      ctx.fillText(lb, x, h - 6);
    });
    // series
    series.forEach(s => {
      ctx.strokeStyle = s.color; ctx.lineWidth = 2.5; ctx.beginPath();
      let started = false;
      s.data.forEach((v, i) => {
        if (v == null) return;
        const x = padL + (s.data.length === 1 ? plotW / 2 : plotW * i / (s.data.length - 1));
        const y = padT + plotH * (1 - (v - min) / (max - min));
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // points
      ctx.fillStyle = s.color;
      s.data.forEach((v, i) => {
        if (v == null) return;
        const x = padL + (s.data.length === 1 ? plotW / 2 : plotW * i / (s.data.length - 1));
        const y = padT + plotH * (1 - (v - min) / (max - min));
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      });
    });
  },

  /* ---- Bar chart ---- */
  bar(canvas, labels, data, color, opts = {}) {
    const { ctx, w, h } = this._prep(canvas);
    ctx.clearRect(0, 0, w, h);
    const padL = 30, padR = 10, padT = 12, padB = 22;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const max = opts.max || Math.max(...data, 1);
    const grid = this._css('--ring-track', 'rgba(120,120,128,0.18)');
    const sub = this._css('--text-sub', '#888');
    ctx.strokeStyle = grid; ctx.fillStyle = sub; ctx.font = '10px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 2; i++) {
      const y = padT + plotH * i / 2;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillText(Math.round(max - max * i / 2), padL - 4, y + 3);
    }
    const bw = plotW / data.length * 0.6;
    const gap = plotW / data.length;
    ctx.textAlign = 'center';
    data.forEach((v, i) => {
      const x = padL + gap * i + gap / 2;
      const bh = plotH * (v / max);
      ctx.fillStyle = color;
      this._roundRect(ctx, x - bw / 2, padT + plotH - bh, bw, bh, 4);
      ctx.fill();
      ctx.fillStyle = sub;
      ctx.fillText(labels[i], x, h - 6);
    });
  },

  _roundRect(ctx, x, y, w, h, r) {
    if (h < 1) h = 1;
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  _empty(ctx, w, h) {
    ctx.fillStyle = this._css('--text-sub', '#888');
    ctx.textAlign = 'center';
    ctx.font = '12px -apple-system, system-ui, sans-serif';
    ctx.fillText('No data yet', w / 2, h / 2);
  },
};

if (typeof window !== 'undefined') window.Charts = Charts;
