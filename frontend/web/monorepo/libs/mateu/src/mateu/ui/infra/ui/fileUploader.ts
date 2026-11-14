/**
 * Sends a picked file to the app's storage port (design/uploads/file-uploads-contract.md §4):
 * streamed through Mateu (`POST uploadUrl`, raw bytes, the ticket + the app's Mateu credentials), or
 * — when the field says `uploadDirect` — to the pre-signed target the store issues (`POST
 * uploadUrl/target` first; the bytes then go to that url WITHOUT Mateu credentials; a 404 there
 * falls back to the streamed upload). The HTTP leg is injected (`UploadTransport`), so the protocol
 * is unit-tested; the field uses `xhrTransport` (XMLHttpRequest: upload progress + abort). Mirror of the
 * React Native app's src/core/fileUploader.ts.
 */
import { resolveUploadUrl, uploadErrorOf, uploadHeaders, uploadTargetOf, uploadedValueOf, type UploadConfig } from './fileUploads.ts';
import { chromeText } from './chromeTexts.ts';
import { underPublicBase } from '@infra/http/publicBase.ts';

export interface UploadRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
  /** Called with the fraction (0..1) sent, when the platform reports it. */
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

export interface UploadResponse {
  status: number;
  text: string;
}

export type UploadTransport = (request: UploadRequest) => Promise<UploadResponse>;

/** The part of the Mateu api client an upload needs (MateuApiClient satisfies it). */
export interface UploadApi {
  readonly baseUrl: string;
  /** The headers a request to `url` carries — the credentials only when `url` is trusted with them. */
  headers(extra?: Record<string, string>, url?: string): Promise<Record<string, string>>;
}

/** The file to send: its body is whatever the transport can send (a Blob / File). */
export interface PickedFile {
  name: string;
  contentType?: string;
  /** -1 / undefined = unknown. */
  size?: number;
  body: unknown;
}

/** A refused or failed upload; `message` is what the user is shown. */
export class UploadError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** The upload was cancelled by the user (nothing to show). */
export class UploadCancelled extends Error {
  constructor() {
    super('cancelled');
  }
}

/** The Mateu credentials for `url` plus the upload's own headers (which win over the JSON defaults). */
async function mateuHeaders(api: UploadApi, url: string, own: Record<string, string>): Promise<Record<string, string>> {
  const merged = { ...(await api.headers({}, url)), ...own };
  return merged;
}

/** Uploads `file` for a field in upload mode and returns the value to commit (a `mateu-file:` reference). */
export async function uploadFile(api: UploadApi, config: UploadConfig, file: PickedFile, transport: UploadTransport,
  onProgress?: (fraction: number) => void, signal?: AbortSignal): Promise<string> {
  if (!config.uploadTicket || !config.uploadUrl) throw new UploadError(0, chromeText('uploadsNotAvailable'));
  // the server names its ROOT path (`/mateu/v3/upload`): under a context path or a prefix-stripping
  // proxy (`/crm`) it is `/crm/mateu/v3/upload` as the browser sees it (GA review 2, N-10). This
  // leg is the web's only: the phone's base url is absolute, so its upload url always is too
  const url = underPublicBase(resolveUploadUrl(api.baseUrl, config.uploadUrl));
  const ticket = config.uploadTicket;

  if (config.uploadDirect) {
    const targetUrl = url.replace(/\/+$/, '') + '/target';
    const answer = await send(transport, {
      method: 'POST',
      url: targetUrl,
      headers: await mateuHeaders(api, targetUrl, { 'X-Mateu-Upload-Ticket': ticket, 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify({ name: file.name, contentType: file.contentType || 'application/octet-stream', size: file.size ?? -1 }),
      signal,
    });
    if (answer.status === 200) {
      const target = uploadTargetOf(answer.text);
      if (!target) throw new UploadError(answer.status, chromeText('uploadFailed'));
      // the pre-signed url belongs to the store, not to Mateu: only the headers the store asked for
      const sent = await send(transport, {
        method: target.method,
        url: target.url,
        headers: { ...(file.contentType && !hasHeader(target.headers, 'content-type') ? { 'Content-Type': file.contentType } : {}), ...target.headers },
        body: file.body,
        onProgress,
        signal,
      });
      if (sent.status < 200 || sent.status >= 300) throw new UploadError(sent.status, uploadErrorOf(sent.status, sent.text));
      return target.value;
    }
    if (answer.status !== 404) throw new UploadError(answer.status, uploadErrorOf(answer.status, answer.text));
    // 404: the store issued no target — stream it through Mateu
  }

  const answer = await send(transport, {
    method: 'POST',
    url,
    headers: await mateuHeaders(api, url, uploadHeaders(ticket, file.name, file.contentType)),
    body: file.body,
    onProgress,
    signal,
  });
  if (answer.status !== 200) throw new UploadError(answer.status, uploadErrorOf(answer.status, answer.text));
  const value = uploadedValueOf(answer.text);
  if (!value) throw new UploadError(answer.status, chromeText('uploadFailed'));
  return value;
}

const hasHeader = (headers: Record<string, string>, name: string): boolean => Object.keys(headers).some((k) => k.toLowerCase() === name);

async function send(transport: UploadTransport, request: UploadRequest): Promise<UploadResponse> {
  if (request.signal?.aborted) throw new UploadCancelled();
  try {
    return await transport(request);
  } catch (e) {
    if (e instanceof UploadCancelled || request.signal?.aborted) throw new UploadCancelled();
    throw new UploadError(0, uploadErrorOf(0, ''));
  }
}

/** The app's transport: XMLHttpRequest, which reports upload progress and can be aborted. */
export const xhrTransport: UploadTransport = (request) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(request.method, request.url);
    for (const [k, v] of Object.entries(request.headers)) xhr.setRequestHeader(k, v);
    if (request.onProgress && xhr.upload) {
      xhr.upload.onprogress = (e: ProgressEvent) => {
        if (e.lengthComputable && e.total > 0) request.onProgress?.(Math.min(1, e.loaded / e.total));
      };
    }
    xhr.onload = () => resolve({ status: xhr.status, text: String(xhr.responseText ?? '') });
    xhr.onerror = () => reject(new Error('network'));
    xhr.ontimeout = () => reject(new Error('timeout'));
    xhr.onabort = () => reject(new UploadCancelled());
    request.signal?.addEventListener('abort', () => xhr.abort());
    xhr.send(request.body as XMLHttpRequestBodyInit);
  });
