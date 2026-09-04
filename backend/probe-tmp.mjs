import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
// Simulates the fix: the controller's Keycloak boot appends the hidden <mateu-ui> for a
// deferred-boot page too, before starting it — it is not only a render root, it carries the
// baseUrl and is the URL-mode signal the VB shell reads.
await p.addInitScript(() => {
  const add = () => {
    if (document.body && !document.querySelector('mateu-ui')) {
      const u = document.createElement('mateu-ui');
      u.setAttribute('baseUrl', ''); u.setAttribute('pathPrefix', '');
      document.body.appendChild(u);
    } else if (!document.body) requestAnimationFrame(add);
  };
  add();
});
await p.goto('https://rw.ec1.mateu.io/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2500);
if (await p.locator('#username').count()) {
  await p.fill('#username', 'demo'); await p.fill('#password', 'demo');
  await p.click('input[type=submit], button[type=submit]');
  await p.waitForTimeout(8000);
}
console.log(await p.evaluate(() => JSON.stringify({
  hasMateuUi: !!document.querySelector('mateu-ui'),
  pathMode: window.__mateuUrlPathMode,
  href: location.href,
}, null, 1)));
await b.close();
