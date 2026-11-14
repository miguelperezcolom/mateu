/// <reference types="node" />
import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  acceptsFile,
  attributesOf,
  fallbackMaxBytes,
  fileRefLabel,
  formatBytes,
  isUploadMode,
  parseFileRef,
  percentEncode,
  resolveUploadUrl,
  toFileRef,
  tooLargeMessage,
  uploadConfigOf,
  uploadErrorOf,
  uploadHeaders,
  uploadTargetOf,
  withFile,
  withoutFile,
} from './fileUploads.ts';
import { chromeText, chromeTextf } from './chromeTexts.ts';
import { uploadFile, UploadCancelled, UploadError, type UploadRequest, type UploadResponse } from './fileUploader.ts';

test('attributes come as {key, value} pairs or as a map', () => {
  assert.deepEqual(attributesOf([{ key: 'accept', value: '.pdf' }, { key: 'x' }, null]), { accept: '.pdf' });
  assert.deepEqual(attributesOf({ multiple: true, maxBytes: 5 }), { multiple: 'true', maxBytes: '5' });
  assert.deepEqual(attributesOf(undefined), {});
});

test('the ticket switches the field to upload mode', () => {
  const c = uploadConfigOf([
    { key: 'uploadUrl', value: '/mateu/v3/upload' }, { key: 'uploadTicket', value: 't.s' },
    { key: 'uploadDirect', value: 'true' }, { key: 'multiple', value: 'true' }, { key: 'maxBytes', value: '2048' },
  ]);
  assert.equal(isUploadMode(c), true);
  assert.equal(c.uploadDirect, true);
  assert.equal(c.multiple, true);
  assert.equal(c.maxBytes, 2048);
  const plain = uploadConfigOf([{ key: 'accept', value: 'image/*' }]);
  assert.equal(isUploadMode(plain), false);
  assert.equal(fallbackMaxBytes(plain), 10485760);
  assert.equal(fallbackMaxBytes(c), 2048);
});

test('sizes print in a 1024 base, integer when exact, else one decimal', () => {
  assert.equal(formatBytes(0), '0 bytes');
  assert.equal(formatBytes(1023), '1023 bytes');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(10485760), '10 MB');
  assert.equal(formatBytes(20 * 1024 * 1024), '20 MB');
  assert.equal(formatBytes(3 * 1024 ** 3), '3 GB');
  assert.equal(tooLargeMessage(10485760), chromeTextf('fileTooLarge', { max: '10 MB' }));
});

test('a mateu-file reference round-trips; + is a literal plus', () => {
  const value = toFileRef({ id: 'a/b 1', name: 'Informe (v2)+ñ.pdf', contentType: 'application/pdf', size: 1536, url: 'https://cdn.x/a?b=1' });
  assert.equal(value, 'mateu-file:a%2Fb%201?name=Informe%20%28v2%29%2B%C3%B1.pdf&type=application%2Fpdf&size=1536&url=https%3A%2F%2Fcdn.x%2Fa%3Fb%3D1');
  assert.deepEqual(parseFileRef(value), { id: 'a/b 1', name: 'Informe (v2)+ñ.pdf', contentType: 'application/pdf', size: 1536, url: 'https://cdn.x/a?b=1' });
  assert.equal(parseFileRef('mateu-file:x?name=a+b')?.name, 'a+b');
  assert.deepEqual(parseFileRef('mateu-file:only'), { id: 'only' });
  assert.equal(parseFileRef('data:text/plain;base64,aGk='), null);
  assert.equal(toFileRef({ id: 'x', size: -1 }), 'mateu-file:x');
  assert.equal(percentEncode("a!*'()~._-"), 'a%21%2A%27%28%29~._-');
});

test('a stored file shows its name (else its id) and its size', () => {
  assert.equal(fileRefLabel({ id: 'k1', name: 'a.pdf', size: 2048 }), 'a.pdf · 2 KB');
  assert.equal(fileRefLabel({ id: 'k1' }), 'k1');
});

test('a multiple field appends; a single one replaces', () => {
  assert.deepEqual(withFile(['a'], 'b', true), ['a', 'b']);
  assert.deepEqual(withFile('', 'b', true), ['b']);
  assert.equal(withFile('a', 'b', false), 'b');
  assert.deepEqual(withoutFile(['a', 'b', 'c'], 1, true), ['a', 'c']);
  assert.equal(withoutFile('a', 0, false), '');
});

test('the upload url resolves against the backend origin', () => {
  assert.equal(resolveUploadUrl('https://h.io/app', '/mateu/v3/upload'), 'https://h.io/mateu/v3/upload');
  assert.equal(resolveUploadUrl('https://h.io/app/', 'up'), 'https://h.io/app/up');
  assert.equal(resolveUploadUrl('', '/mateu/v3/upload'), '/mateu/v3/upload');
  assert.equal(resolveUploadUrl('https://h.io', 'https://o.io/u'), 'https://o.io/u');
});

test('upload headers and answers', () => {
  assert.deepEqual(uploadHeaders('t', 'a b.pdf', undefined), {
    'X-Mateu-Upload-Ticket': 't', 'X-Mateu-File-Name': 'a%20b.pdf', 'Content-Type': 'application/octet-stream', Accept: 'application/json',
  });
  assert.equal(uploadErrorOf(413, '{"error":"Too large","message":"This file is too large (max 20 MB)."}'), 'This file is too large (max 20 MB).');
  assert.equal(uploadErrorOf(403, 'nope'), chromeText('uploadNotAllowed'));
  assert.deepEqual(uploadTargetOf('{"url":"https://s3/x","headers":{"x-a":"1"},"value":"mateu-file:x"}'),
    { url: 'https://s3/x', method: 'PUT', headers: { 'x-a': '1' }, value: 'mateu-file:x' });
});

// ── the protocol, over a fake transport ───────────────────────────────────────────────────────

const api = {
  baseUrl: 'https://app.io/ui',
  async headers(extra: Record<string, string> = {}, url: string = 'https://app.io/ui') {
    const base = { 'Content-Type': 'application/json', Accept: 'application/json' };
    return url.startsWith('https://app.io/') ? { ...base, Authorization: 'Bearer T', 'X-Session-Id': 's', ...extra } : { ...base, ...extra };
  },
};
const streamed = uploadConfigOf({ uploadUrl: '/mateu/v3/upload', uploadTicket: 'TK' });
const direct = uploadConfigOf({ uploadUrl: '/mateu/v3/upload', uploadTicket: 'TK', uploadDirect: 'true' });
const file = { name: 'a b.pdf', contentType: 'application/pdf', size: 3, body: 'BYTES' };

function fake(answers: UploadResponse[]) {
  const seen: UploadRequest[] = [];
  return { seen, transport: async (r: UploadRequest) => { seen.push(r); return answers.shift() ?? { status: 500, text: '' }; } };
}

test('streamed: the raw bytes go to the upload url with the ticket and the Mateu credentials', async () => {
  const t = fake([{ status: 200, text: '{"value":"mateu-file:k1?name=a%20b.pdf","file":{}}' }]);
  const value = await uploadFile(api, streamed, file, t.transport);
  assert.equal(value, 'mateu-file:k1?name=a%20b.pdf');
  assert.equal(t.seen.length, 1);
  const r = t.seen[0];
  assert.equal(r.method, 'POST');
  assert.equal(r.url, 'https://app.io/mateu/v3/upload');
  assert.equal(r.body, 'BYTES');
  assert.equal(r.headers['X-Mateu-Upload-Ticket'], 'TK');
  assert.equal(r.headers['X-Mateu-File-Name'], 'a%20b.pdf');
  assert.equal(r.headers['Content-Type'], 'application/pdf');
  assert.equal(r.headers.Authorization, 'Bearer T');
});

test('N-10: under a public base path (context path / prefix-stripping proxy) both legs go under it', async () => {
  const { setPublicBase } = await import('@infra/http/publicBase.ts');
  setPublicBase('/crm');
  try {
    const relative = { ...api, baseUrl: '/crm/admin' };
    const t = fake([{ status: 404, text: '' }, { status: 200, text: '{"value":"mateu-file:k2","file":{}}' }]);
    assert.equal(await uploadFile(relative, direct, file, t.transport), 'mateu-file:k2');
    assert.deepEqual(t.seen.map((r) => r.url), ['/crm/mateu/v3/upload/target', '/crm/mateu/v3/upload']);
  } finally {
    setPublicBase('');
  }
});

test('a refusal carries the server message', async () => {
  const t = fake([{ status: 413, text: '{"error":"Too large","message":"This file is too large (max 20 MB)."}' }]);
  await assert.rejects(uploadFile(api, streamed, file, t.transport), (e) => e instanceof UploadError && e.status === 413 && e.message === 'This file is too large (max 20 MB).');
});

test('direct: ask for a target, then send the bytes there without Mateu credentials', async () => {
  const t = fake([
    { status: 200, text: '{"url":"https://store.io/put/1","method":"PUT","headers":{"x-amz":"v"},"value":"mateu-file:s1","file":{}}' },
    { status: 201, text: '' },
  ]);
  const value = await uploadFile(api, direct, file, t.transport);
  assert.equal(value, 'mateu-file:s1');
  const [target, put] = t.seen;
  assert.equal(target.url, 'https://app.io/mateu/v3/upload/target');
  assert.deepEqual(JSON.parse(String(target.body)), { name: 'a b.pdf', contentType: 'application/pdf', size: 3 });
  assert.equal(target.headers['X-Mateu-Upload-Ticket'], 'TK');
  assert.equal(target.headers.Authorization, 'Bearer T');
  assert.equal(put.method, 'PUT');
  assert.equal(put.url, 'https://store.io/put/1');
  assert.deepEqual(put.headers, { 'Content-Type': 'application/pdf', 'x-amz': 'v' });
  assert.equal(put.body, 'BYTES');
});

test('direct: a 404 target falls back to the streamed upload', async () => {
  const t = fake([{ status: 404, text: '{"error":"Not found"}' }, { status: 200, text: '{"value":"mateu-file:k2"}' }]);
  assert.equal(await uploadFile(api, direct, file, t.transport), 'mateu-file:k2');
  assert.equal(t.seen[1].url, 'https://app.io/mateu/v3/upload');
});

test('a cancelled upload is told apart from a failure', async () => {
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(uploadFile(api, streamed, file, fake([]).transport, undefined, abort.signal), (e) => e instanceof UploadCancelled);
  const broken = async () => { throw new TypeError('network'); };
  await assert.rejects(uploadFile(api, streamed, file, broken), (e) => e instanceof UploadError && e.status === 0);
});

test('accept follows the server rule: extension, type prefix or exact type', () => {
  assert.equal(acceptsFile(undefined, 'a.exe', undefined), true);
  assert.equal(acceptsFile('.pdf, image/*', 'Report.PDF', 'application/pdf'), true);
  assert.equal(acceptsFile('.pdf, image/*', 'cat.png', 'image/png'), true);
  assert.equal(acceptsFile('application/pdf', 'x.bin', 'application/pdf; charset=binary'), true);
  assert.equal(acceptsFile('.pdf, image/*', 'notes.txt', 'text/plain'), false);
});
