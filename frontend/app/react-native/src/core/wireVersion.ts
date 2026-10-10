/**
 * Wire-version compatibility (pure, unit-tested). Every UIIncrementDto carries `wireVersion`
 * ("3.0" today). This renderer declares the range it was built for: same MAJOR, and at least the
 * minimum minor. A backend answering with another major speaks a wire this build cannot promise to
 * render; a NEWER minor is fine (additive by contract) but worth a note in the dev log. A response
 * without the field is an older backend that predates the field — accepted silently.
 */

/** The oldest wire this renderer supports. */
export const MIN_WIRE_VERSION = '3.0';

export type WireCheck = { ok: true; note?: string } | { ok: false; message: string };

const parse = (v: string): [number, number] => {
  const [maj, min] = v.split('.');
  return [parseInt(maj ?? '0', 10) || 0, parseInt(min ?? '0', 10) || 0];
};

export function checkWireVersion(received: unknown, min: string = MIN_WIRE_VERSION): WireCheck {
  if (typeof received !== 'string' || !received) return { ok: true };
  const [rMaj, rMin] = parse(received);
  const [mMaj, mMin] = parse(min);
  if (rMaj !== mMaj) {
    return {
      ok: false,
      message: `This app supports Mateu wire ${mMaj}.x (≥ ${min}); the server speaks ${received}. Some screens may not render correctly — update the app or the server.`,
    };
  }
  if (rMin < mMin) {
    return {
      ok: false,
      message: `The server speaks Mateu wire ${received}, older than the ${min} this app needs. Please update the server.`,
    };
  }
  return rMin > mMin ? { ok: true, note: `server wire ${received} is newer than ${min} (additive — fine)` } : { ok: true };
}
