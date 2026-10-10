## What and why

<!-- What does this change, and why? Link the issue: "Closes #123". -->

## How it was verified

<!-- Tests added/updated, and anything checked by hand (a screenshot for UI changes). -->

## Checklist

- [ ] Tests added or updated (`*SyncTest` in core, vitest, e2e…)
- [ ] Wire-visible change? Ported to .NET and Python, and handled by the renderers — or the PR says which are left for later
- [ ] Frontend changed? Renderer bundles regenerated (`npm run copy`)
- [ ] Docs updated under `doc/` (and `npm run verify` passes there)
- [ ] Public API changed? Deprecated rather than removed, and listed in `CHANGELOG.md`
- [ ] Commits signed off (`git commit -s`, see CONTRIBUTING.md)
