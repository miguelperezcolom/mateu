// A small, dependency-free YAML emitter for the specs/ui files the converter writes: block style,
// plain scalars where YAML reads them back as the same string, JSON-style double quotes otherwise
// (a JSON string is a valid YAML double-quoted scalar). Only what the converter produces is
// supported — strings, numbers, booleans, null, arrays and plain objects.

const RESERVED = /^(true|false|yes|no|on|off|null|~|y|n)$/i
const NUMERIC = /^[-+]?(\d[\d_]*)?(\.\d+)?([eE][-+]?\d+)?$|^0x|^0o|^\.inf$|^\.nan$/i

/**
 * What a plain scalar cannot hold: the line breaks YAML 1.1 knows besides `\n` (CR, NEL, LINE and
 * PARAGRAPH SEPARATOR: Figma types U+2028 for Shift+Enter in a text layer) and every character
 * outside YAML's printable set (C0/C1 controls, DEL, U+FFFE/U+FFFF, lone surrogates).
 */
const UNPRINTABLE =
  /[\u0000-\u0008\u000b\u000c\u000d\u000e-\u001f\u007f-\u009f\u2028\u2029\ufffe\uffff]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/
const ESCAPED = new RegExp(UNPRINTABLE.source, 'g')

/** True when `s` can be written unquoted and still reads back as the same string. */
export function isPlain(s) {
  if (s === '' || s !== s.trim()) return false
  if (UNPRINTABLE.test(s)) return false
  if (RESERVED.test(s) || NUMERIC.test(s)) return false
  // starts with an indicator, or holds a sequence YAML gives meaning to
  if (/^[-?:,\[\]{}#&*!|>'"%@`]/.test(s)) return false
  // `${…}` is quoted although a block scalar could hold it: it reads as the expression it is
  if (/: |:$| #|[\n\t]|\$\{/.test(s)) return false
  return true
}

function scalar(v) {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'boolean' || typeof v === 'number') return String(v)
  const s = String(v)
  if (isPlain(s)) return s
  // a JSON string is a YAML double-quoted scalar, but JSON leaves NEL, the C1 controls, U+2028/2029
  // and U+FFFE/FFFF raw: escape them the way YAML reads them back (`\uXXXX`)
  return JSON.stringify(s).replace(ESCAPED, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)
}

function key(k) {
  return /^[A-Za-z_$][A-Za-z0-9_$.-]*$/.test(k) && !RESERVED.test(k) ? k : JSON.stringify(k)
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

function lines(value, indent) {
  const pad = ' '.repeat(indent)
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${pad}[]`]
    const out = []
    for (const item of value) {
      if (isObject(item) && Object.keys(item).length > 0) {
        const inner = lines(item, indent + 2)
        out.push(`${pad}- ${inner[0].trimStart()}`, ...inner.slice(1))
      } else if (Array.isArray(item) && item.length > 0) {
        out.push(`${pad}-`, ...lines(item, indent + 2))
      } else {
        out.push(`${pad}- ${inline(item)}`)
      }
    }
    return out
  }
  if (isObject(value)) {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined)
    if (entries.length === 0) return [`${pad}{}`]
    const out = []
    for (const [k, v] of entries) {
      if ((isObject(v) && Object.keys(v).length > 0) || (Array.isArray(v) && v.length > 0)) {
        out.push(`${pad}${key(k)}:`, ...lines(v, indent + 2))
      } else {
        out.push(`${pad}${key(k)}: ${inline(v)}`)
      }
    }
    return out
  }
  return [`${pad}${scalar(value)}`]
}

function inline(v) {
  if (Array.isArray(v)) return '[]'
  if (isObject(v)) return '{}'
  return scalar(v)
}

/** The YAML text of `value` (an object at the root), ending with a newline. */
export function toYaml(value) {
  return lines(value, 0).join('\n') + '\n'
}
