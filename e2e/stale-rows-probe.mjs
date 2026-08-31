// Probe: navigating from one listing to another must never show the OUTGOING listing's rows
// under the INCOMING listing's header/columns.
import { chromium } from 'playwright'
const BASE = process.env.BASE || 'http://localhost:8595'
const DELAY = Number(process.env.DELAY || 700)   // artificial backend latency, widens the window
const b = await chromium.launch()
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage()
// slow every mateu call so the gap between "structure lands" and "rows land" is visible
await p.route('**/mateu/v3/**', async route => { await new Promise(r=>setTimeout(r, DELAY)); await route.continue() })
const inject = ()=>{
  window.__deep = (fn)=>{ const out=[]; const walk=(n,d)=>{ if(d>60) return; const kids=[]; if(n.shadowRoot) kids.push(...n.shadowRoot.children); kids.push(...n.children); for(const k of kids){ try{ if(fn(k)) out.push(k) }catch(e){}; walk(k,d+1) } }; walk(document.body,0); return out }
  window.__clickText = (txt)=>{ const els = window.__deep(e=>e.textContent && e.textContent.trim()===txt && e.children.length===0); const el = els[els.length-1]; if(el){ el.click(); return true } return false }
  window.__snap = ()=> window.__deep(e=>e.tagName==='MATEU-TABLE-CRUD').map(e=>{
      const md = e.component?.metadata || {}
      const rows = e.data?.[e.id]?.page?.content || []
      return { title: md.title, cols: (md.columns||[]).map(c=>c.metadata?.id).join(','), n: rows.length, first: JSON.stringify(rows[0]||{}).slice(0,80) }
  })
}
await p.goto(BASE, {waitUntil:'domcontentloaded'})
for(let i=0;i<40;i++){ await p.waitForTimeout(500); await p.evaluate(inject); const ok = await p.evaluate(()=>!!window.__deep(e=>e.tagName==='MATEU-APP').length); if(ok) break }
async function click(t){ for(let i=0;i<20;i++){ await p.evaluate(inject); if(await p.evaluate(x=>window.__clickText(x), t)) return true; await p.waitForTimeout(300) } throw new Error('not found: '+t) }
async function waitRows(){ for(let i=0;i<60;i++){ await p.evaluate(inject); const s = await p.evaluate(()=>window.__snap()); if(s[0]?.n>0) return s[0]; await p.waitForTimeout(200) } throw new Error('no rows') }

await click('Products'); const a = await waitRows(); console.log('listing A:', JSON.stringify(a))
await click('Reservations')
const seen = []
for(let i=0;i<60;i++){ await p.evaluate(inject); const s = await p.evaluate(()=>window.__snap()); if(s[0]) seen.push({t:i*100, ...s[0]}); await p.waitForTimeout(100); if(s[0]?.title && s[0].title!==a.title && s[0].n>0 && s[0].first!==a.first) break }
const stale = seen.filter(s => s.title && s.title !== a.title && s.n > 0 && s.first === a.first)
console.log('samples:', seen.length, 'distinct:', JSON.stringify([...new Set(seen.map(s=>s.title+'|'+s.n+'|'+s.first.slice(0,30)))], null, 1))
if (stale.length) { console.log('FAIL: stale rows under the new header for ~'+(stale.length*100)+'ms'); console.log(JSON.stringify(stale[0])); process.exitCode = 1 }
else console.log('PASS: the incoming listing never showed the outgoing listing rows')
await b.close()
