/**
 * Renderer VB/Redwood LOCAL contra una UI Mateu ya desplegada.
 *
 * Abre un navegador sobre la app desplegada (rw.ec1.mateu.io y hermanas) e INTERCEPTA la
 * petición del bundle de la app VB para servir el que acabas de construir en tu árbol de
 * trabajo. El navegador sigue estando, a todos los efectos, en el origen desplegado: el login
 * de Keycloak, el token, el gateway y las rutas /_pod de los menús federados funcionan tal
 * cual. Lo único que cambia es de dónde sale el JS del renderer.
 *
 * Por qué así y no sirviendo la app en local (vb-serve :9006): eso obliga a abrir CORS en el
 * gateway, a dar de alta el redirect_uri de localhost en el cliente de Keycloak y a replicar el
 * arranque de Keycloak que inyecta el controller de Mateu. Tres cosas que tocar en el cluster
 * para ver un cambio de una línea.
 *
 * Uso (desde e2e/):
 *   node vb-live-dev.mjs                          # rw.ec1.mateu.io, login demo/demo, headed
 *   node vb-live-dev.mjs --url https://rw-console.ec1.mateu.io --user admin --pass ...
 *   node vb-live-dev.mjs --watch                  # reconstruye al tocar poc/ o webApps/ y recarga
 *   node vb-live-dev.mjs --route /booking/bookings
 *
 * El bundle se lee EN CADA petición: reconstruir (npm run build en apps/redwood) y recargar la
 * página basta, sin reiniciar esto.
 */
import { chromium } from 'playwright';
import { parseArgs } from 'node:util';
import { existsSync, readFileSync, readdirSync, statSync, watch } from 'node:fs';
import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { values } = parseArgs({
  options: {
    url:    { type: 'string', default: 'https://rw.ec1.mateu.io' },
    user:   { type: 'string', default: 'demo' },
    pass:   { type: 'string', default: 'demo' },
    route:  { type: 'string', default: '' },
    watch:  { type: 'boolean', default: false },
    headless: { type: 'boolean', default: false },
  },
  strict: false,
});

const app = join(dirname(fileURLToPath(import.meta.url)), '..', 'frontend', 'web', 'monorepo', 'apps', 'redwood');
const optimized = join(app, 'build', 'optimized', 'webApps', 'vbredwoodapp');

/** El bundle de la última construcción: el directorio version_<ts> más reciente. */
function bundlePath() {
  if (!existsSync(optimized)) return null;
  const versions = readdirSync(optimized)
    .filter((d) => d.startsWith('version_'))
    .map((d) => ({ d, at: statSync(join(optimized, d)).mtimeMs }))
    .sort((a, b) => b.at - a.at);
  for (const { d } of versions) {
    const candidate = join(optimized, d, 'bundles', 'vb-app-bundle.js');
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

const build = () => new Promise((resolve) => {
  console.log('· construyendo…');
  execFile('npm', ['run', 'build'], { cwd: app, maxBuffer: 1 << 26 }, () => {
    // vb-build aborta al final en una subtarea de red y devuelve != 0 con el artefacto BIEN
    // generado (ver README): se mira el artefacto, no el código de salida.
    console.log('· construido:', bundlePath());
    resolve();
  });
});

if (!bundlePath()) {
  console.log('No hay build/optimized todavía.');
  await build();
}

// `viewport: null` = la página ocupa la VENTANA. Con un viewport fijo, en modo headed
// Playwright pinta la página a ese tamaño dentro de una ventana más grande y deja franjas en
// blanco a la derecha y abajo — que se leen como un fallo de maquetación del renderer y no lo
// son (me pasó: costó media hora de medir cajas antes de caer).
const browser = await chromium.launch({
  headless: !!values.headless,
  args: values.headless ? [] : ['--start-maximized'],
});
const ctx = await browser.newContext({
  viewport: values.headless ? { width: 1600, height: 1000 } : null,
});

await ctx.route('**/vb-app-bundle.js', async (route) => {
  const path = bundlePath();
  if (!path) return route.continue();
  // el copy del jar sustituye el base de desarrollo por '' (mismo origen); aquí igual, o el
  // bridge llamaría a localhost en vez de al backend desplegado
  const body = readFileSync(path, 'utf8').replaceAll('http://localhost:8595', '');
  await route.fulfill({ status: 200, contentType: 'application/javascript', body });
});

const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('  [console]', m.text().slice(0, 200)); });
page.on('pageerror', (e) => console.log('  [pageerror]', e.message.slice(0, 200)));
page.on('response', (r) => {
  const u = r.url();
  if (u.includes('/mateu/') && r.status() >= 400) console.log('  [http]', r.status(), u);
});

await page.goto(values.url + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
if (await page.locator('#username').count()) {
  await page.fill('#username', values.user);
  await page.fill('#password', values.pass);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('#kc-login, input[type=submit]'),
  ]);
  console.log('· sesión iniciada como', values.user);
}
if (values.route) {
  await page.waitForTimeout(8000);
  await page.evaluate((r) => { window.location.hash = r; }, values.route);
}

if (values.watch) {
  let timer = null;
  for (const dir of ['poc', 'webApps']) {
    watch(join(app, dir), { recursive: true }, (_e, file) => {
      if (!file || file.includes('/build/') || file.endsWith('~')) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        console.log('· cambio en', dir + '/' + file);
        await new Promise((r) => execFile('npm', ['run', 'bridge'], { cwd: app }, r));
        await build();
        await page.reload({ waitUntil: 'domcontentloaded' });
      }, 400);
    });
  }
  console.log('· modo watch: al guardar en poc/ o webApps/ reconstruye y recarga');
}

console.log(`\n  Renderer LOCAL sirviéndose sobre ${values.url} — el navegador queda abierto.`);
console.log('  Ctrl+C para cerrar.\n');
await new Promise(() => {});
