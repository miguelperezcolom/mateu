let stubbed = new Set();
export async function initialize({ packages }) {
  stubbed = new Set(packages);
}
export async function resolve(specifier, context, next) {
  if (stubbed.has(specifier)) {
    return { url: new URL(`./placeholder.mjs?pkg=${encodeURIComponent(specifier)}`, import.meta.url).href, shortCircuit: true };
  }
  return next(specifier, context);
}
