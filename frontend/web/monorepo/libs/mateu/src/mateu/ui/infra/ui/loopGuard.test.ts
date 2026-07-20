import { describe, it, expect, beforeEach } from 'vitest';
import { loopGuard } from './loopGuard.ts';

describe('loopGuard', () => {
  beforeEach(() => {
    loopGuard.reset();
    loopGuard.configure({ windowMs: 4000, threshold: 12 });
  });

  it('allows requests below the threshold', () => {
    for (let i = 0; i < 11; i++) {
      expect(loopGuard.check('sig-a', 1000 + i).blocked).toBe(false);
    }
  });

  it('blocks once an identical request crosses the threshold within the window', () => {
    let blockedAt = -1;
    for (let i = 0; i < 20; i++) {
      const v = loopGuard.check('sig-a', 1000 + i);
      if (v.blocked && blockedAt < 0) blockedAt = i;
    }
    // 12th identical call (index 11) trips
    expect(blockedAt).toBe(11);
  });

  it('reports the loop only once per burst (firstTrip)', () => {
    let firstTrips = 0;
    let blocks = 0;
    for (let i = 0; i < 20; i++) {
      const v = loopGuard.check('sig-a', 1000 + i);
      if (v.blocked) blocks++;
      if (v.firstTrip) firstTrips++;
    }
    expect(blocks).toBeGreaterThan(1);
    expect(firstTrips).toBe(1);
  });

  it('does not trip on different request signatures interleaved', () => {
    let anyBlocked = false;
    for (let i = 0; i < 60; i++) {
      const sig = 'sig-' + (i % 10); // 10 distinct signatures, 6 each
      if (loopGuard.check(sig, 1000 + i).blocked) anyBlocked = true;
    }
    expect(anyBlocked).toBe(false);
  });

  it('recovers once the burst ages out of the window', () => {
    // saturate then trip at t≈1000
    for (let i = 0; i < 15; i++) loopGuard.check('sig-a', 1000 + i);
    expect(loopGuard.check('sig-a', 1015).blocked).toBe(true);
    // a lone call well after the window has cleared is allowed again
    expect(loopGuard.check('sig-a', 1000 + 5000).blocked).toBe(false);
  });

  it('re-arms the one-shot report after cooling down', () => {
    for (let i = 0; i < 15; i++) loopGuard.check('sig-a', 1000 + i);
    expect(loopGuard.check('sig-a', 1015).firstTrip).toBe(false); // already reported in burst 1
    // cool down past the window, then a fresh burst reports again
    loopGuard.check('sig-a', 1000 + 5000); // lone, ages out the old ones
    let firstTrips = 0;
    for (let i = 0; i < 15; i++) {
      if (loopGuard.check('sig-a', 6000 + i).firstTrip) firstTrips++;
    }
    expect(firstTrips).toBe(1);
  });

  it('reset() clears all recorded activity', () => {
    for (let i = 0; i < 15; i++) loopGuard.check('sig-a', 1000 + i);
    loopGuard.reset();
    expect(loopGuard.check('sig-a', 1015).blocked).toBe(false);
  });
});
