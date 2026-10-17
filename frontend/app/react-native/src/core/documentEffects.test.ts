// What the user gets when an action returns a document (documentEffects.ts), per platform: the
// browser on web, the system browser for a URL, the share sheet on iOS, an opener app on Android.
// react-native / expo-web-browser / expo-file-system are replaced. Needs module mocks.
import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { stubNativePackages } from '../../scripts/test/native-packages.mjs';

stubNativePackages(['react-native', 'expo-web-browser', 'expo-file-system']);

type Json = Record<string, any>;
const platform = { OS: 'ios' };
const log: Json[] = [];
class FakeFile {
  uri: string;
  contentUri: string;
  constructor(dir: string, name: string) {
    this.uri = `file://${dir}/${name}`;
    this.contentUri = `content://cache/${name}`;
    log.push({ kind: 'file', name });
  }
  create(o: Json) { log.push({ kind: 'create', ...o }); }
  write(bytes: Uint8Array) { log.push({ kind: 'write', text: new TextDecoder().decode(bytes) }); }
}
mock.module('react-native', {
  namedExports: {
    Platform: platform,
    Linking: { openURL: async (u: string) => { log.push({ kind: 'openURL', u }); } },
    Share: { share: async (c: Json, o: Json) => { log.push({ kind: 'share', c, o }); } },
  },
});
mock.module('expo-web-browser', {
  namedExports: { openBrowserAsync: async (u: string) => { log.push({ kind: 'browser', u }); } },
});
mock.module('expo-file-system', { namedExports: { File: FakeFile, Paths: { cache: '/cache' } } });

const { presentDocument } = await import('./documentEffects.ts');
const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64');

beforeEach(() => {
  log.length = 0;
  platform.OS = 'ios';
});

test('nothing usable in the payload: nothing happens', async () => {
  assert.equal(await presentDocument(null, 'https://srv/app'), 'none');
  assert.equal(await presentDocument({ url: 'javascript:alert(1)' }, 'https://srv/app'), 'none');
  assert.equal(log.length, 0);
});

test('a URL document opens in the system browser, resolved against the backend origin', async () => {
  assert.equal(await presentDocument({ url: '/mateu/files/123', filename: 'r.pdf' }, 'https://srv/app'), 'browser');
  assert.deepEqual(log, [{ kind: 'browser', u: 'https://srv/mateu/files/123' }]);
});

test('iOS: inline bytes are written to the cache (decoded) and handed to the share sheet', async () => {
  const r = await presentDocument({ base64Content: b64('hello pdf'), filename: '../inv/../x.pdf', mimeType: 'application/pdf' }, 'https://srv');
  assert.equal(r, 'shared');
  const file = log.find((e) => e.kind === 'file')!;
  assert.ok(!file.name.includes('/'), 'the file name never escapes the cache directory');
  assert.deepEqual(log.find((e) => e.kind === 'create'), { kind: 'create', overwrite: true });
  assert.equal(log.find((e) => e.kind === 'write')!.text, 'hello pdf');
  const share = log.find((e) => e.kind === 'share')!;
  assert.equal(share.c.url, `file:///cache/${file.name}`);
  assert.equal(share.o.subject, file.name);
});

test('Android: inline bytes open in the app that handles the type, through a content:// uri', async () => {
  platform.OS = 'android';
  assert.equal(await presentDocument({ base64Content: b64('x'), filename: 'a.csv' }, 'https://srv'), 'opened');
  assert.deepEqual(log.at(-1), { kind: 'openURL', u: 'content://cache/a.csv' });
});

test('web: a download link is clicked (a data: uri for inline bytes); an inline URL opens in a new tab', async () => {
  platform.OS = 'web';
  const clicks: Json[] = [];
  const opened: Json[] = [];
  (globalThis as any).document = {
    createElement: () => {
      const a: Json = { click: () => clicks.push({ href: a.href, download: a.download }), remove: () => clicks.push({ removed: true }) };
      return a;
    },
    body: { appendChild: () => {} },
  };
  (globalThis as any).open = (u: string, t: string) => opened.push({ u, t });
  try {
    assert.equal(await presentDocument({ base64Content: b64('a,b'), filename: 'e.csv', mimeType: 'text/csv' }, 'https://srv'), 'web');
    assert.deepEqual(clicks, [{ href: `data:text/csv;base64,${b64('a,b')}`, download: 'e.csv' }, { removed: true }]);
    assert.equal(await presentDocument({ url: 'https://cdn/x.pdf', disposition: 'inline' }, 'https://srv'), 'web');
    assert.deepEqual(opened, [{ u: 'https://cdn/x.pdf', t: '_blank' }]);
    assert.equal(log.length, 0, 'no native API is touched on web');
  } finally {
    delete (globalThis as any).document;
    delete (globalThis as any).open;
  }
});
