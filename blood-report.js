/* =====================================================================
   blood-report.js
   Blood marker definitions, healthy-range logic, colour coding, and
   improvement-percentage calculations for the Blood Report tracker.
   ===================================================================== */

/* Each marker: key, label, unit, optimal direction, healthy range.
   `good` direction = 'low' means lower is better, 'high' means higher is better. */
const BLOOD_MARKERS = [
  { key: 'weight', label: 'Weight',            unit: 'kg',    dir: 'low',  ref: '—' },
  { key: 'waist',  label: 'Waist',             unit: 'cm',    dir: 'low',  ref: '< 90' },
  { key: 'alt',    label: 'ALT (SGPT)',        unit: 'U/L',   dir: 'low',  ref: '7–40',  warn: 40,  high: 56 },
  { key: 'ast',    label: 'AST (SGOT)',        unit: 'U/L',   dir: 'low',  ref: '8–40',  warn: 40,  high: 50 },
  { key: 'ldl',    label: 'LDL',               unit: 'mg/dL', dir: 'low',  ref: '< 100', warn: 100, high: 130 },
  { key: 'hdl',    label: 'HDL',               unit: 'mg/dL', dir: 'high', ref: '> 40',  warn: 40,  low: 35 },
  { key: 'tc',     label: 'Total Cholesterol', unit: 'mg/dL', dir: 'low',  ref: '< 200', warn: 200, high: 240 },
  { key: 'tg',     label: 'Triglycerides',     unit: 'mg/dL', dir: 'low',  ref: '< 150', warn: 150, high: 200 },
  { key: 'vitd',   label: 'Vitamin D',         unit: 'ng/mL', dir: 'high', ref: '30–100',warn: 30,  low: 20 },
  { key: 'b12',    label: 'Vitamin B12',       unit: 'pg/mL', dir: 'high', ref: '200–900',warn: 200, low: 150 },
  { key: 'hba1c',  label: 'HbA1c',             unit: '%',     dir: 'low',  ref: '< 5.7', warn: 5.7, high: 6.5 },
];

const BloodReport = {
  markers: BLOOD_MARKERS,

  /* status colour for a marker value: 'green' | 'yellow' | 'red' | '' */
  status(marker, value) {
    if (value == null || value === '' || isNaN(value)) return '';
    const v = +value;
    if (marker.dir === 'low') {
      if (marker.high != null && v >= marker.high) return 'red';
      if (marker.warn != null && v >= marker.warn) return 'yellow';
      return marker.warn != null ? 'green' : '';
    } else { // high is better
      if (marker.low != null && v <= marker.low) return 'red';
      if (marker.warn != null && v < marker.warn) return 'yellow';
      return marker.warn != null ? 'green' : '';
    }
  },

  /* improvement % between first and latest entry for a marker.
     Positive = improved (moved in the healthy direction). */
  improvement(entries, marker) {
    const vals = entries
      .map(e => ({ d: e.date, v: e[marker.key] }))
      .filter(x => x.v != null && x.v !== '' && !isNaN(x.v));
    if (vals.length < 2) return null;
    const first = +vals[0].v, last = +vals[vals.length - 1].v;
    if (first === 0) return null;
    let pct = ((last - first) / Math.abs(first)) * 100;
    if (marker.dir === 'low') pct = -pct; // dropping is improvement
    return { pct: +pct.toFixed(1), first, last };
  },

  /* series for charting one marker over time */
  series(entries, key) {
    return entries
      .filter(e => e[key] != null && e[key] !== '' && !isNaN(e[key]))
      .map(e => ({ date: e.date, value: +e[key] }));
  },
};

if (typeof window !== 'undefined') {
  window.BLOOD_MARKERS = BLOOD_MARKERS;
  window.BloodReport = BloodReport;
}
