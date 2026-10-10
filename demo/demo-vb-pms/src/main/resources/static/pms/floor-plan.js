// <pms-floor-plan rooms='[{"number":"101","status":"CL","type":"STD"},…]' selected="104">
// A third-party-style web component the demo serves itself, mounted by Mateu as an `Element`
// (the official escape hatch). It draws one floor as an SVG plan, rooms coloured by
// housekeeping status, and emits `room-selected` (CustomEvent, detail {room}) on click — Mateu
// sends that detail to the server as the action's `event` parameter.
const COLORS = {
  CL: ['#E3F1DF', '#1F6E2F'], IP: ['#D5ECE9', '#0E5E57'], DI: ['#FBE1DC', '#A1281A'],
  PU: ['#FDF0D2', '#8A5300'], OS: ['#E4E4E4', '#555555'], OO: ['#D6D6D6', '#333333'],
}
class PmsFloorPlan extends HTMLElement {
  static get observedAttributes() { return ['rooms', 'selected'] }
  connectedCallback() { this.render() }
  attributeChangedCallback() { this.render() }
  render() {
    let rooms = []
    try { rooms = JSON.parse(this.getAttribute('rooms') || '[]') } catch (e) { rooms = [] }
    const selected = this.getAttribute('selected') || ''
    const w = 110, h = 86, gap = 8, perRow = 5
    const cells = rooms.map((r, i) => {
      const x = 16 + (i % perRow) * (w + gap)
      const y = (i < perRow ? 16 : 16 + h + 64)
      const [bg, ink] = COLORS[r.status] || COLORS.CL
      const sel = r.number === selected
      return `<g class="room" data-room="${r.number}" tabindex="0" role="button"
          aria-label="Room ${r.number}, ${r.statusLabel || r.status}" style="cursor:pointer">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${bg}"
          stroke="${sel ? '#161513' : ink}" stroke-width="${sel ? 3 : 1}"/>
        <text x="${x + 10}" y="${y + 26}" font-size="18" font-weight="700" fill="${ink}">${r.number}</text>
        <text x="${x + 10}" y="${y + 48}" font-size="12" fill="${ink}">${r.type}</text>
        <text x="${x + 10}" y="${y + 70}" font-size="12" font-weight="600" fill="${ink}">${r.status}</text>
      </g>`
    }).join('')
    const corridorY = 16 + h + 18
    this.innerHTML = `<svg viewBox="0 0 ${16 * 2 + perRow * (w + gap)} ${16 * 2 + h * 2 + 64}"
        style="width:100%;max-width:760px;display:block;font-family:inherit" role="group" aria-label="Floor plan">
      <rect x="16" y="${corridorY}" width="${perRow * (w + gap) - gap}" height="28" rx="4" fill="#F1EFED"/>
      <text x="${16 + 12}" y="${corridorY + 19}" font-size="12" fill="#6F6B66">Corridor</text>
      ${cells}</svg>`
    for (const g of this.querySelectorAll('.room')) {
      const fire = () => this.dispatchEvent(new CustomEvent('room-selected', {
        detail: { room: g.getAttribute('data-room') }, bubbles: true, composed: true }))
      g.addEventListener('click', fire)
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire() } })
    }
  }
}
if (!customElements.get('pms-floor-plan')) customElements.define('pms-floor-plan', PmsFloorPlan)
