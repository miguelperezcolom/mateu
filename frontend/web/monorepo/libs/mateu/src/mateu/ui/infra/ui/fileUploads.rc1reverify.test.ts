/// <reference types="node" />
// rc.1 re-verification of GA review 2 N-10: uploads under the public base path, on the STREAMED leg
// (the fix's own test drives the direct leg) and with the base url the client holds as the server
// names it (`/admin`, the public base not on it).
import { afterEach, test } from 'vitest'
import assert from 'node:assert/strict'
import { uploadConfigOf } from './fileUploads.ts'
import { uploadFile, type UploadRequest, type UploadResponse } from './fileUploader.ts'
import { setPublicBase } from '@infra/http/publicBase.ts'

afterEach(() => setPublicBase(''))

const api = { baseUrl: '/admin', async headers(extra: Record<string, string> = {}) { return { ...extra } } }
const file = { name: 'a.pdf', contentType: 'application/pdf', size: 3, body: 'BYTES' }
const fake = (answers: UploadResponse[]) => {
  const seen: UploadRequest[] = []
  return { seen, transport: async (r: UploadRequest) => { seen.push(r); return answers.shift() ?? { status: 500, text: '' } } }
}

test('rc.1 N-10: streamed upload under /crm posts to /crm/mateu/v3/upload', async () => {
  setPublicBase('/crm')
  const t = fake([{ status: 200, text: '{"value":"mateu-file:k","file":{}}' }])
  const value = await uploadFile(api, uploadConfigOf({ uploadUrl: '/mateu/v3/upload', uploadTicket: 'TK' }), file, t.transport)
  assert.equal(value, 'mateu-file:k')
  assert.deepEqual(t.seen.map((r) => r.url), ['/crm/mateu/v3/upload'])
  assert.equal(t.seen[0].headers['X-Mateu-Upload-Ticket'], 'TK')
})

test('rc.1 N-10 (control): with no public base nothing changes', async () => {
  const t = fake([{ status: 200, text: '{"value":"mateu-file:k","file":{}}' }])
  await uploadFile(api, uploadConfigOf({ uploadUrl: '/mateu/v3/upload', uploadTicket: 'TK' }), file, t.transport)
  assert.deepEqual(t.seen.map((r) => r.url), ['/mateu/v3/upload'])
})
