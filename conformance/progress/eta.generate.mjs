// The reference estimator behind conformance/progress/eta.json — the spec every backend follows.
// Regenerate: node conformance/progress/eta.generate.mjs > conformance/progress/eta.json
// (the corpus is then frozen: a backend that disagrees is the one to fix).
const ALPHA = 0.3
const MIN_RATE_UPDATES = 2
const MIN_ELAPSED_MS = 2000

function estimator() {
  let first = null
  let prev = null
  let ema = null
  let updates = 0
  return (s) => {
    if (s.state && s.state !== 'running') return null
    const p = s.fraction != null ? s.fraction : (s.total > 0 ? (s.done ?? 0) / s.total : null)
    if (p == null || !Number.isFinite(p)) return null
    const t = s.t
    if (prev == null || p < prev.p || t < prev.t) {
      first = { t, p }
      prev = { t, p }
      ema = null
      updates = 0
      return null
    }
    if (p > prev.p && t > prev.t) {
      const r = (p - prev.p) / (t - prev.t)
      ema = ema == null ? r : ALPHA * r + (1 - ALPHA) * ema
      updates++
      prev = { t, p }
    }
    if (updates < MIN_RATE_UPDATES || t - first.t < MIN_ELAPSED_MS || !(ema > 0) || !(p > 0 && p < 1)) return null
    // a hair under an exact second is that second (floating point noise must not add one)
    return Math.ceil((1 - p) / ema / 1000 - 1e-6)
  }
}

const steps = (times, at) => times.map((t, i) => ({ t, ...at(i) }))

const cases = [
  { name: 'steady progress: an estimate once three samples span two seconds',
    samples: steps([0, 1000, 2000, 3000, 4000], (i) => ({ fraction: i * 0.1 })) },
  { name: 'too early: three samples within two seconds say nothing yet',
    samples: [{ t: 0, fraction: 0 }, { t: 500, fraction: 0.1 }, { t: 1000, fraction: 0.2 }] },
  { name: 'indeterminate: no fraction and no total never estimates',
    samples: [{ t: 0 }, { t: 1000 }, { t: 5000 }, { t: 9000 }] },
  { name: 'countable work: done of total counts like a fraction',
    samples: steps([0, 1000, 2000, 3000], (i) => ({ done: i * 30, total: 300 })) },
  { name: 'a stall slows the estimate down',
    samples: [{ t: 0, fraction: 0 }, { t: 1000, fraction: 0.1 }, { t: 2000, fraction: 0.2 },
      { t: 3000, fraction: 0.2 }, { t: 8000, fraction: 0.2 }, { t: 9000, fraction: 0.3 }] },
  { name: 'going backwards starts over',
    samples: [{ t: 0, fraction: 0 }, { t: 1000, fraction: 0.2 }, { t: 2000, fraction: 0.4 },
      { t: 3000, fraction: 0.1 }, { t: 4000, fraction: 0.2 }, { t: 5000, fraction: 0.3 }, { t: 6000, fraction: 0.4 }] },
  { name: 'finished: no estimate',
    samples: [{ t: 0, fraction: 0 }, { t: 1000, fraction: 0.3 }, { t: 2000, fraction: 0.6 }, { t: 3000, fraction: 1, state: 'done' }] },
  { name: 'at 100% while still running: nothing left to estimate',
    samples: [{ t: 0, fraction: 0 }, { t: 1000, fraction: 0.5 }, { t: 2000, fraction: 0.8 }, { t: 3000, fraction: 1 }] },
  { name: 'a burst moves the estimate, but less than its own rate would',
    samples: [{ t: 0, fraction: 0 }, { t: 2000, fraction: 0.05 }, { t: 4000, fraction: 0.1 },
      { t: 6000, fraction: 0.15 }, { t: 6500, fraction: 0.35 }] },
  { name: 'long work: hours',
    samples: [{ t: 0, fraction: 0 }, { t: 60000, fraction: 0.001 }, { t: 120000, fraction: 0.002 }, { t: 180000, fraction: 0.003 }] },
]

for (const c of cases) {
  const estimate = estimator()
  c.expected = c.samples.map(estimate)
}

console.log(JSON.stringify({
  description: 'The ETA of a running task (ProgressDto.etaSeconds), computed by the SERVER from the Progress commands it streams (Java EtaEstimator, .NET EtaEstimator, Python eta_estimator). Each case is one task\'s Progress commands in order: t = server clock in ms when the command was observed, fraction (0..1) or done/total, state (default running). expected[i] = the etaSeconds stamped on the i-th command (null = none).',
  rules: [
    'p = fraction when present, else done/total when total > 0, else indeterminate: never an estimate',
    'a state other than running: null',
    'the first sample, or p (or the clock) going backwards, starts over: first = prev = this sample, no rate yet',
    'p > prev.p and t > prev.t: segment rate r = (p - prev.p) / (t - prev.t); ema = r the first time, else 0.3*r + 0.7*ema; prev = this sample. A sample that does not advance leaves prev where it was, so a stall lowers the next rate',
    'an estimate only after 2 rate updates AND t - first.t >= 2000 AND 0 < p < 1',
    'etaSeconds = ceil((1 - p) / ema / 1000 - 1e-6) (the 1e-6 absorbs floating point noise: an exact 8 s must not read 9)',
  ],
  cases,
}, null, 2))
