import { test, expect } from '@playwright/test';
import { actAs } from './_support';

/**
 * Role-based access in the browser — the same screen for three callers. Mateu does not
 * authenticate: the identity comes from the app (here mvc-app1's TEST-ONLY
 * CookieRolesPrincipalResolver, roles from a cookie), and every decision is taken on the SERVER per
 * request. Fixtures: JRolesPage (/j/roles: @EyesOnly, @ReadOnlyUnless, @DisabledUnless),
 * journeys-routes.yaml (/j/managers-only: `access: {roles: [manager]}`) and sample1's YAML
 * walkthrough page (an `eyesOnly` field for admins).
 */

const note = 'Internal note'
const limit = 'Credit limit'

test.describe('access by role (/j/roles)', () => {

  test('anonymous: the restricted field is not sent, the guarded field is read-only, the guarded button is disabled', async ({ page }) => {
    const bodies: string[] = []
    page.on('response', async r => { if (r.url().includes('/mateu/v3/')) bodies.push(await r.text().catch(() => '')) })
    await page.goto('/j/roles')
    await expect(page.getByRole('textbox', { name: 'Customer' })).toHaveValue('Acme Corp')
    await expect(page.getByRole('textbox', { name: note })).toHaveCount(0)
    // stripped from the state too, not only hidden: the value never reaches this browser
    expect(bodies.join('\n')).not.toContain('Pays late on purpose')
    await expect(page.getByRole('textbox', { name: limit })).toHaveCount(0)
    await expect(page.getByRole('group', { name: limit })).toContainText('5000')
    await expect(page.getByRole('button', { name: 'Approve' })).toBeDisabled()
  })

  test('staff: sees the internal note, the limit stays read-only and Approve disabled', async ({ page, context, baseURL }) => {
    await actAs(context, baseURL, 'staff')
    await page.goto('/j/roles')
    await expect(page.getByRole('textbox', { name: note })).toHaveValue('Pays late on purpose')
    await expect(page.getByRole('textbox', { name: limit })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Approve' })).toBeDisabled()
  })

  test('manager: edits the limit and approves with the edited value', async ({ page, context, baseURL }) => {
    await actAs(context, baseURL, 'staff', 'manager')
    await page.goto('/j/roles')
    const box = page.getByRole('textbox', { name: limit })
    await expect(box).toHaveValue('5000')
    await box.fill('7500')
    await box.blur()
    await page.getByRole('button', { name: 'Approve' }).click()
    await expect(page.getByText('Approved Acme Corp with a limit of 7500').first()).toBeVisible()
  })

  test('a disabled button is refused on the server too: staff replaying the manager\'s request gets 403', async ({ page, context, baseURL }) => {
    await actAs(context, baseURL, 'manager')
    await page.goto('/j/roles')
    const approve = page.waitForRequest(r => r.method() === 'POST' && (r.postData() ?? '').includes('"approve"'))
    await page.getByRole('button', { name: 'Approve' }).click()
    const sent = await approve
    await expect(page.getByText(/^Approved Acme Corp/).first()).toBeVisible()

    await context.clearCookies()
    await actAs(context, baseURL, 'staff')
    const replay = await context.request.post(sent.url(), {
      headers: { 'content-type': 'application/json' }, data: sent.postData()!,
    })
    expect(replay.status()).toBe(403)
    expect(await replay.text()).not.toContain('Approved')
  })
})

test.describe('YAML access: and eyesOnly by role', () => {

  test('a route restricted to managers is refused to staff and opens for a manager', async ({ page, context, baseURL }) => {
    await actAs(context, baseURL, 'staff')
    await page.goto('/j/managers-only')
    await expect(page.getByRole('alert').filter({ hasText: 'You are not allowed to do this.' }).first()).toBeAttached()
    await expect(page.getByText('Quarterly targets')).toHaveCount(0)

    await actAs(context, baseURL, 'manager')
    await page.goto('/j/managers-only')
    await expect(page.getByText('Quarterly targets')).toBeVisible()
  })

  test('an eyesOnly YAML field appears for the role it names', async ({ page, context, baseURL }) => {
    await page.goto('/walkthrough/page')
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible()
    await expect(page.getByRole('spinbutton', { name: 'Salary' })).toHaveCount(0)

    await actAs(context, baseURL, 'admin')
    await page.goto('/walkthrough/page')
    await expect(page.getByRole('spinbutton', { name: 'Salary' })).toBeVisible()
  })

  test('a YAML route for admins opens for an admin (the anonymous refusal is in the shared suite)', async ({ page, context, baseURL }) => {
    await actAs(context, baseURL, 'admin')
    await page.goto('/walkthrough/restricted')
    await expect(page.getByText(/^Flavour:/)).toBeVisible()
    await expect(page.getByText('You are not allowed to do this.')).toHaveCount(0)
  })
})
