/**
 * Museum demo — the WRITE paths, on the Vaadin renderer: every form of demo/demo-museum that saves
 * goes through a proxied REST source (the write key stays on the server), so each check fills a form
 * in a real browser, submits it, and then asks museum-service itself whether the write landed.
 *
 *   museum-service on :8121 with --museum.write-key=localdev
 *   demo-museum on :8601 with MATEU_SECRET_MUSEUM_WRITE_KEY=localdev
 *   cd e2e && node museum-writes-probe.mjs
 *
 * It writes to the in-memory database; restart museum-service to forget it. Exits non-zero on any
 * failure.
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:8601'
const API = process.env.API ?? 'http://localhost:8121'
const api = async (path) => (await fetch(API + path)).json()

const browser = await chromium.launch()
// en-US: the date pickers parse what is typed in the browser's locale
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'en-US' })
let failures = 0
const check = (ok, what, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? '✓' : '✗'} ${what}${detail ? '  — ' + detail : ''}`)
}
const open = async (route) => {
  await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000)
}
const pick = async (label, option) => {
  await page.getByLabel(label, { exact: true }).first().click()
  await page.waitForTimeout(800)
  await page.getByRole('option', { name: option }).first().click()
  await page.waitForTimeout(300)
}
const date = async (label, mdy) => {
  await page.getByLabel(label).first().fill(mdy)
  await page.keyboard.press('Enter')
  await page.keyboard.press('Escape')
}
const press = async (text) => {
  await page.getByText(text, { exact: true }).last().click()
  await page.waitForTimeout(4000)
}

async function loanWizard() {
  const before = (await api('/api/loans?status=requested')).totalElements
  await open('loans/new')
  await pick('Artwork', 'Saint John on Patmos')
  await page.getByText('The exhibition', { exact: true }).first().click()
  await pick('Exhibition', /Highlights of Royal Collection of Graphic Art/)
  await page.getByText('Dates', { exact: true }).first().click()
  await date('Leaves the lender', '2/20/2027')
  await date('Back home by', '9/30/2027')
  await page.getByText('Insurance and transport', { exact: true }).first().click()
  await page.getByLabel('Insured for (USD)').first().fill('12500000')
  await page.getByLabel('Courier').first().fill('Ana López')
  await press('Request')
  const latest = (await api('/api/loans?status=requested&sort=id,desc&size=1')).content[0]
  check((await api('/api/loans?status=requested')).totalElements === before + 1, 'the loan wizard creates a requested loan')
  check(latest?.artworkTitle === 'Saint John on Patmos' && latest?.fromMuseumName === 'The Metropolitan Museum of Art'
      && latest?.toMuseumName === 'Statens Museum for Kunst' && latest?.insuranceValue === 12500000,
    'with the work, the lender and borrower filled in by the API, and the insured value', JSON.stringify(latest).slice(0, 160))
  check(page.url().endsWith(`/loans/${latest?.id}`), 'and opens the new loan', page.url())
}

async function moveATask() {
  await open('conservation/tasks/1')
  await pick('Status', 'Done')
  await press('Save')
  check((await api('/api/conservation-tasks/1')).status === 'done', 'a task moved to Done on its form is done in the API')
  check(page.url().endsWith('/conservation'), 'and the board opens again', page.url())
}

async function editAnArtwork() {
  await open('artworks/133/edit')
  await page.getByLabel('Gallery').first().fill('Room 226')
  await press('Save')
  const a = await api('/api/artworks/133')
  check(a.gallery === 'Room 226', 'an artwork edit is saved', a.gallery)
  check(a.imageSmall?.startsWith('https://iip.smk.dk/') && a.imageCredit?.includes('Public domain'),
    "and the museum's image and credit survive it")
}

async function createAnArtwork() {
  await open('artworks/new')
  await page.getByLabel('Title').first().fill('A Probe in the Gallery')
  await pick('Museum', 'Cleveland Museum of Art')
  await pick('Kind', 'Painting')
  await page.getByLabel('Estimated value (USD)').first().fill('250000')
  await press('Create')
  const found = (await api('/api/artworks?search=A%20Probe%20in%20the%20Gallery')).content[0]
  check(found?.museumName === 'Cleveland Museum of Art' && found?.estimatedValue === 250000, 'a new artwork is created', JSON.stringify(found ?? {}).slice(0, 120))
  check(page.url().endsWith(`/artworks/${found?.id}`), 'and its page opens', page.url())
}

async function planAnExhibition() {
  await open('exhibitions/new')
  await page.getByLabel('Title').first().fill('Probes and Portraits')
  await pick('Museum', 'Statens Museum for Kunst')
  await date('Opens', '5/1/2027')
  await date('Closes', '8/31/2027')
  await page.getByLabel('Budget (USD)').first().fill('400000')
  await press('Create')
  const found = (await api('/api/exhibitions?search=Probes%20and%20Portraits')).content[0]
  check(found?.status === 'planned' && found?.startDate === '2027-05-01' && found?.museumName === 'Statens Museum for Kunst',
    'a new exhibition is planned', JSON.stringify(found ?? {}).slice(0, 140))
}

const ONLY = process.env.ONLY?.split(',')
for (const step of [loanWizard, moveATask, editAnArtwork, createAnArtwork, planAnExhibition]) {
  if (ONLY && !ONLY.includes(step.name)) continue
  await step().catch(async (e) => {
    check(false, step.name, e.message.split('\n').slice(0, 3).join(' '))
    if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/fail-${step.name}.png` })
  })
}
await browser.close()
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed')
process.exit(failures ? 1 : 0)
