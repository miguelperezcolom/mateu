/** Dotted numeric version compare (pure). Negative when a < b. "1.2" == "1.2.0"; junk counts as 0.
 *  Same rule as AppRegistry.compareVersions, kept here so the pure hub modules need no Expo import. */
export function compareVersionStrings(a: string, b: string): number {
  const pa = String(a).split('.');
  const pb = String(b).split('.');
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = parseInt(pa[i] ?? '0', 10) || 0;
    const nb = parseInt(pb[i] ?? '0', 10) || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}
