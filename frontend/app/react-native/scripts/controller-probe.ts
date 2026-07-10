/**
 * Dev-only controller probe: drives the REAL MateuViewController (no React) against a live demo
 * backend, asserting the increment pipeline end to end — listing render + OnLoad search data,
 * row → detail navigation, detail → edit (bubbled through the orchestrator), client-side
 * validation blocking a bubbled submit, and the state-only merge. Run with:
 *
 *   npx tsx scripts/controller-probe.ts   (backend: demo-admin-panel at :8592)
 */
import { MateuSession } from '../src/core/MateuSession';
import { MateuViewController, RenderedView } from '../src/core/MateuViewController';
import { NavTarget } from '../src/core/MateuSession';

const BASE = process.env.MATEU_BASE_URL ?? 'http://localhost:8592';
const PRODUCTS_SST = 'io.mateu.mdd.demoadminpanel.infra.in.ui.Products';

let failures = 0;
function check(name: string, ok: boolean, detail = ''): void {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
}

function componentTypes(component: unknown, out: string[] = []): string[] {
  if (!component || typeof component !== 'object') return out;
  const c = component as Record<string, any>;
  const t = c['metadata']?.['type'] ?? c['type'];
  if (t) out.push(String(t));
  for (const ch of c['children'] ?? []) componentTypes(ch, out);
  return out;
}

async function waitFor(predicate: () => boolean, timeoutMs = 6000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return predicate();
}

async function main(): Promise<void> {
  const session = new MateuSession(BASE, 'controller-probe', {});
  const notifications: string[] = [];
  session.notify = (_title, text, variant) => notifications.push(`${variant}: ${text}`);

  // ── 1) listing: render + OnLoad search data ──────────────────────────────────────────
  const listing = new MateuViewController(session);
  let lastView: RenderedView = listing.rendered;
  listing.onRender = (v) => (lastView = v);
  let crudData: any = null;
  listing.registerDataHandler('crud', (d) => (crudData = d));
  const openedDetails: NavTarget[] = [];
  listing.detailOpener = (t) => openedDetails.push(t);

  await listing.navigate('/products', '/products', PRODUCTS_SST);
  await waitFor(() => componentTypes(lastView.component).includes('Crud'));
  check('listing renders a Crud', componentTypes(lastView.component).includes('Crud'));

  await waitFor(() => crudData !== null);
  const rows = crudData?.crud?.page?.content ?? crudData?.content ?? [];
  check('OnLoad search delivered rows', Array.isArray(rows) && rows.length > 0, `rows=${rows.length}`);

  // ── 2) row → detail via the state-only _route fragment ──────────────────────────────
  const firstRow = rows[0] ?? { id: '0001' };
  await listing.runAction('view', { ...firstRow });
  await waitFor(() => openedDetails.length > 0);
  check(
    'view action opens the detail through detailOpener',
    openedDetails.length === 1 && openedDetails[0].route.startsWith('/products/'),
    openedDetails[0]?.route ?? 'none',
  );

  // ── 3) detail: navigate, then edit bubbles to the orchestrator ──────────────────────
  const detail = new MateuViewController(session);
  let detailView: RenderedView = detail.rendered;
  detail.onRender = (v) => (detailView = v);
  const target = openedDetails[0];
  await detail.navigate(target.route, target.consumedRoute, target.serverSideType);
  await waitFor(() => detailView.component !== null && !detailView.loading);
  check('detail renders a Page', componentTypes(detailView.component).includes('Page'));
  check('detail state carries the entity', String(detailView.state?.['id'] ?? '') !== '');

  const versionBeforeEdit = detailView.version;
  await detail.runAction('edit');
  await waitFor(() => detailView.version > versionBeforeEdit && !detailView.loading);
  const editTypes = componentTypes(detailView.component);
  check('edit navigates in place to the edit form', editTypes.includes('Page'), `types=${editTypes.slice(0, 4).join(',')}`);
  check(
    'edit form is editable (writable fields present)',
    JSON.stringify(detailView.component).includes('"readOnly":false'),
  );

  // ── 4) client-side validation blocks a bubbled submit ───────────────────────────────
  detail.putState('name', '');
  const versionBeforeCreate = detailView.version;
  await detail.runAction('create');
  check(
    'empty required name blocks create with a field error',
    detail.fieldErrors['name'] !== undefined,
    JSON.stringify(detail.fieldErrors),
  );
  check('validation warned the user', notifications.some((n) => n.startsWith('warning:')));
  check('no navigation happened while invalid', detailView.version >= versionBeforeCreate && !detailView.loading);

  // ── 5) state-only merge: doNothing mutates the model in place ────────────────────────
  detail.putState('name', 'Producto probe');
  const before = JSON.stringify(detail.currentComponentState['components'] ?? []);
  await detail.runAction('doNothing');
  await waitFor(() => JSON.stringify(detail.currentComponentState['components'] ?? []) !== before);
  check(
    'doNothing merged the fresh state in place (components grew)',
    JSON.stringify(detail.currentComponentState['components'] ?? []).length > before.length,
  );

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECKS FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('probe crashed:', e);
  process.exit(1);
});
