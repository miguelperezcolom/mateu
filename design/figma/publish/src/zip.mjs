// A zip with every file STORED (no compression): what both hosts accept, in forty lines, with no
// dependency. The site is mostly already-minified JavaScript, so deflate would save little here.

const TABLE = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

export function crc32(bytes) {
  let c = 0xffffffff
  for (const b of bytes) c = TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const le = (n, size) => Array.from({ length: size }, (_, i) => (n >>> (8 * i)) & 0xff)
const toBytes = (v) => (typeof v === 'string' ? new TextEncoder().encode(v) : v)
const FIXED_DOS_DATE = 0x21 // 1980-01-01: the same site gives the same zip

/** `files`: path → string | Uint8Array. Returns the zip as a Uint8Array. */
export function zip(files) {
  const chunks = []
  const central = []
  let offset = 0
  for (const [path, value] of files) {
    const name = new TextEncoder().encode(path)
    const data = toBytes(value)
    const crc = crc32(data)
    const common = [...le(20, 2), ...le(0x0800, 2), ...le(0, 2), ...le(0, 2), ...le(FIXED_DOS_DATE, 2), ...le(crc, 4), ...le(data.length, 4), ...le(data.length, 4), ...le(name.length, 2), ...le(0, 2)]
    const local = Uint8Array.from([...le(0x04034b50, 4), ...common])
    chunks.push(local, name, data)
    central.push(Uint8Array.from([...le(0x02014b50, 4), ...le(20, 2), ...common, ...le(0, 2), ...le(0, 2), ...le(0, 2), ...le(0, 4), ...le(offset, 4)]), name)
    offset += local.length + name.length + data.length
  }
  const size = central.reduce((n, c) => n + c.length, 0)
  const end = Uint8Array.from([...le(0x06054b50, 4), ...le(0, 2), ...le(0, 2), ...le(files.size, 2), ...le(files.size, 2), ...le(size, 4), ...le(offset, 4), ...le(0, 2)])
  const all = [...chunks, ...central, end]
  const out = new Uint8Array(all.reduce((n, c) => n + c.length, 0))
  let at = 0
  for (const c of all) {
    out.set(c, at)
    at += c.length
  }
  return out
}
