/**
 * Dev-only probe of the editInDrawer crud flow on the REAL MateuViewController (no React):
 * "new" opens a Drawer overlay, "create" persists + closes it emitting the saved event, and the
 * listing refreshes through its OnCustomEvent subscription. Run with:
 *
 *   npx tsx scripts/drawer-probe.ts   (backend: demo-admin-panel at :8592)
 */
import { MateuSession } from '../src/core/MateuSession';
import { MateuViewController, RenderedView } from '../src/core/MateuViewController';

const BASE = process.env.MATEU_BASE_URL ?? 'http://localhost:8592';
const SST = 'io.mateu.mdd.demoadminpanel.infra.in.ui.drawercrud.ContactsDrawerCrud';

let failures = 0;
function check(name: string, ok: boolean, detail = ''): void {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
}

async function waitFor(predicate: () => boolean, timeoutMs = 6000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return predicate();
}

function overlayType(component: unknown): string {
  return String((component as Record<string, any>)?.['metadata']?.['type'] ?? '');
}

async function main(): Promise<void> {
  const session = new MateuSession(BASE, 'drawer-probe', {});
  session.notify = () => {};
  const overlays: unknown[] = [];
  session.openOverlay = (component) => overlays.push(component);
  session.closeTopOverlay = () => overlays.pop();

  const listing = new MateuViewController(session);
  let lastView: RenderedView = listing.rendered;
  listing.onRender = (v) => (lastView = v);
  let crudData: any = null;
  listing.registerDataHandler('crud', (d) => (crudData = d));
  await listing.navigate('/drawer-crud-demo', '/drawer-crud-demo', SST);
  await waitFor(() => crudData !== null);
  const rowsOf = (d: any) => (d?.crud?.page?.content ?? d?.content ?? []).length;
  const rowsBefore = rowsOf(crudData);
  check('listing renders with rows', rowsBefore > 0, `rows=${rowsBefore}`);

  // "new" opens the creation drawer as an overlay (no navigation)
  await listing.runAction('new', {});
  await waitFor(() => overlays.length > 0);
  check('new opens a Drawer overlay', overlays.length === 1 && overlayType(overlays[0]) === 'Drawer',
    `overlays=${overlays.length} type=${overlayType(overlays[0])}`);

  // the drawer's form submits "create" — it bubbles to the crud (bubble action), here we run it
  // on the listing controller directly like the bubbled submit would
  crudData = null;
  await listing.runAction('create', { name: 'Katherine Johnson', email: 'katherine@nasa.gov' });
  const closed = await waitFor(() => overlays.length === 0);
  check('create closes the drawer', closed, `overlays=${overlays.length}`);
  const refreshed = await waitFor(() => rowsOf(crudData) === rowsBefore + 1);
  check('saved event re-runs the search (one more row)', refreshed,
    `rows=${rowsOf(crudData)} (before=${rowsBefore})`);

  console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('probe crashed:', e);
  process.exit(1);
});
