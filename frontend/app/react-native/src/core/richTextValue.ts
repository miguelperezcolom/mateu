/**
 * How a `richText` field's stored value is read — a port of libs/mateu's `richTextValue.ts`. The
 * value is HTML. Values written by the old web editor are Quill Delta JSON (`[{"insert":"…"}]` or
 * `{"ops":[…]}`); those are recognised and turned into the equivalent HTML, so existing data opens
 * as text here too instead of as raw JSON, and is saved as HTML on the next edit. Pure.
 */

type Op = { insert?: unknown; attributes?: Record<string, unknown> };

const isOp = (op: unknown): op is Op => !!op && typeof op === 'object' && 'insert' in (op as object);

/** The ops of a Delta value, or null when the value is not Delta JSON. */
export const deltaOps = (value: string | null | undefined): Op[] | null => {
  const raw = (value ?? '').trim();
  if (!raw.startsWith('[') && !raw.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(raw);
    const ops = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.ops) ? parsed.ops : null;
    return ops && ops.length > 0 && ops.every(isOp) ? ops : null;
  } catch {
    // not JSON: plain text or HTML that happens to start with a bracket
    return null;
  }
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Only http(s), mailto and relative links survive (the web's safeHref rule). */
const safeHref = (link: unknown): string | null => {
  if (typeof link !== 'string' || !link.trim()) return null;
  const l = link.trim();
  if (/^(https?:|mailto:)/i.test(l)) return l;
  return /^[a-z][a-z0-9+.-]*:/i.test(l) ? null : l;
};

const inline = (text: string, a: Record<string, unknown> = {}) => {
  let out = escapeHtml(text);
  if (a.code) out = `<code>${out}</code>`;
  if (a.bold) out = `<strong>${out}</strong>`;
  if (a.italic) out = `<em>${out}</em>`;
  if (a.underline) out = `<u>${out}</u>`;
  if (a.strike) out = `<s>${out}</s>`;
  const href = safeHref(a.link);
  if (href) out = `<a href="${escapeHtml(href)}">${out}</a>`;
  return out;
};

/** Quill Delta → HTML (inline marks, links, headings, lists, quotes, code blocks). */
export const deltaToHtml = (ops: Op[]): string => {
  type Line = { html: string; attrs: Record<string, unknown> };
  const lines: Line[] = [];
  let current = '';
  for (const op of ops) {
    if (typeof op.insert !== 'string') continue; // embeds (images…) are not carried over
    const parts = op.insert.split('\n');
    parts.forEach((part, i) => {
      if (part) current += inline(part, op.attributes);
      if (i < parts.length - 1) {
        lines.push({ html: current, attrs: op.attributes ?? {} });
        current = '';
      }
    });
  }
  if (current) lines.push({ html: current, attrs: {} });

  const out: string[] = [];
  let list: { tag: string; items: string[] } | null = null;
  const flush = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${i}</li>`).join('')}</${list.tag}>`);
    list = null;
  };
  for (const line of lines) {
    const a = line.attrs;
    const listTag = a.list === 'ordered' ? 'ol' : a.list === 'bullet' ? 'ul' : null;
    if (listTag) {
      if (!list || list.tag !== listTag) {
        flush();
        list = { tag: listTag, items: [] };
      }
      list.items.push(line.html);
      continue;
    }
    flush();
    const level = Number(a.header);
    if (level >= 1 && level <= 6) out.push(`<h${level}>${line.html}</h${level}>`);
    else if (a.blockquote) out.push(`<blockquote>${line.html}</blockquote>`);
    else if (a['code-block']) out.push(`<pre><code>${line.html}</code></pre>`);
    else out.push(`<p>${line.html}</p>`);
  }
  flush();
  return out.join('');
};

/** The HTML to open a stored value with: the value itself, or its Delta converted. */
export const richTextHtml = (value: string | null | undefined): string => {
  const ops = deltaOps(value);
  return ops ? deltaToHtml(ops) : (value ?? '');
};
