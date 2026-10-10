import { test } from 'node:test';
import assert from 'node:assert/strict';
import { documentUrl, planDocument, safeFileName, utiOf } from './documents.ts';

test('a document behind a single-use url opens from the backend origin', () => {
  const plan = planDocument(
    { filename: 'big.pdf', mimeType: 'application/pdf', url: '/hotel/mateu/v3/documents/tok', disposition: 'inline' },
    'http://192.168.1.10:8080/hotel',
  );
  assert.deepEqual(plan, {
    kind: 'url',
    url: 'http://192.168.1.10:8080/hotel/mateu/v3/documents/tok',
    filename: 'big.pdf',
    mimeType: 'application/pdf',
    inline: true,
  });
});

test('inline bytes become a cached file to share', () => {
  const plan = planDocument({ filename: 'folio.pdf', mimeType: 'application/pdf', base64Content: 'JVBERi0=' }, 'http://x');
  assert.equal(plan?.kind, 'file');
  assert.equal(plan?.inline, false);
});

test('nothing usable, nothing done; only http(s) urls are followed', () => {
  assert.equal(planDocument(null, 'http://x'), null);
  assert.equal(planDocument({ filename: 'x' }, 'http://x'), null);
  assert.equal(planDocument({ url: 'javascript:alert(1)' }, 'http://x'), null);
  assert.equal(documentUrl('//evil.example/a', 'http://x'), undefined);
  assert.equal(documentUrl('/a', 'not-a-url'), undefined);
  assert.equal(documentUrl('https://cdn.example/a.pdf', ''), 'https://cdn.example/a.pdf');
});

test('the cached file name carries no path or control characters', () => {
  assert.equal(safeFileName('../../etc/passwd'), '_.._etc_passwd');
  assert.equal(safeFileName('a\r\nb.pdf'), 'a__b.pdf');
  assert.equal(safeFileName(''), 'document');
  assert.equal(safeFileName('Factura ñ.pdf'), 'Factura ñ.pdf');
});

test('the share sheet is told what the file is', () => {
  assert.equal(utiOf('application/pdf'), 'com.adobe.pdf');
  assert.equal(utiOf('text/csv; charset=utf-8'), 'public.comma-separated-values-text');
  assert.equal(utiOf('application/x-unknown'), undefined);
});
