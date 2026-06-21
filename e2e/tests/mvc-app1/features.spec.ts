import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers (same as api.spec.ts)
// ---------------------------------------------------------------------------

async function callAction(request: any, url: string, body: object) {
  const response = await request.post(url, {
    data: body,
    headers: { 'Content-Type': 'application/json' },
  });
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  return Array.isArray(json) ? json[0] : json;
}

function allNodes(component: any): any[] {
  if (!component) return [];
  const fromChildren = (component?.children ?? []).flatMap(allNodes);
  const fromContent  = component?.metadata?.content ? allNodes(component.metadata.content) : [];
  return [component, ...fromChildren, ...fromContent];
}

function allFields(fragments: any[]): any[] {
  return fragments
    .flatMap((f: any) => allNodes(f.component))
    .filter((c: any) => c?.metadata?.type === 'FormField')
    .map((c: any) => c.metadata);
}

function allButtons(fragments: any[]): any[] {
  return fragments.flatMap((f: any) => allNodes(f.component)).flatMap((c: any) => c?.metadata?.buttons ?? []);
}

function allToolbar(fragments: any[]): any[] {
  return fragments.flatMap((f: any) => allNodes(f.component)).flatMap((c: any) => c?.metadata?.toolbar ?? []);
}

function pageMetadata(fragments: any[]): any {
  for (const f of fragments) {
    for (const n of allNodes(f.component)) {
      if (n?.metadata?.type === 'Page') return n.metadata;
    }
  }
  return null;
}

function titleCommand(body: any): any {
  return body.commands.find((c: any) => c.type === 'SetWindowTitle');
}

// ---------------------------------------------------------------------------
// FieldTypesForm — /field-types
// ---------------------------------------------------------------------------

const FIELD_TYPES_API = '/field-types/mateu/v3/components/_/action';

test.describe('FieldTypesForm — data types', () => {

  test('load returns title "Field Types Form"', async ({ request }) => {
    const body = await callAction(request, FIELD_TYPES_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Field Types Form');
    expect(body.messages).toHaveLength(0);
  });

  test('textField is string, longField is integer, doubleField is number', async ({ request }) => {
    const body = await callAction(request, FIELD_TYPES_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const byId = (id: string) => fields.find((f: any) => f.fieldId === id);

    expect(byId('textField')?.dataType).toBe('string');
    expect(byId('intField')?.dataType).toBe('integer');
    expect(byId('longField')?.dataType).toBe('integer');
    expect(byId('doubleField')?.dataType).toBe('number');
  });

  test('boolField is bool, dateField is date', async ({ request }) => {
    const body = await callAction(request, FIELD_TYPES_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const byId = (id: string) => fields.find((f: any) => f.fieldId === id);

    expect(byId('boolField')?.dataType).toBe('bool');
    expect(byId('dateField')?.dataType).toBe('date');
  });

  test('dateTimeField is dateTime, timeField is time', async ({ request }) => {
    const body = await callAction(request, FIELD_TYPES_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const byId = (id: string) => fields.find((f: any) => f.fieldId === id);

    expect(byId('dateTimeField')?.dataType).toBe('dateTime');
    expect(byId('timeField')?.dataType).toBe('time');
  });

  test('field labels are humanized from camelCase field names', async ({ request }) => {
    const body = await callAction(request, FIELD_TYPES_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const byId = (id: string) => fields.find((f: any) => f.fieldId === id);

    expect(byId('textField')?.label).toBe('Text field');
    expect(byId('dateTimeField')?.label).toBe('Date time field');
  });

});

// ---------------------------------------------------------------------------
// FieldAnnotationsForm — /field-annotations
// ---------------------------------------------------------------------------

const FIELD_ANN_API = '/field-annotations/mateu/v3/components/_/action';

test.describe('FieldAnnotationsForm — field annotations', () => {

  test('load returns title "Field Annotations Form" with no errors', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Field Annotations Form');
    expect(body.messages).toHaveLength(0);
  });

  test('@Label overrides humanized label', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const name = fields.find((f: any) => f.fieldId === 'name');
    expect(name?.label).toBe('Full Name');
  });

  test('@Help sets description on field', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const email = fields.find((f: any) => f.fieldId === 'email');
    expect(email?.description).toBe('Enter a valid email address');
  });

  test('@Stereotype(email) sets stereotype to "email"', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'email')?.stereotype).toBe('email');
  });

  test('@Stereotype(password) sets stereotype to "password"', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'password')?.stereotype).toBe('password');
  });

  test('@Stereotype(textarea) sets stereotype to "textarea"', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'bio')?.stereotype).toBe('textarea');
  });

  test('@Colspan(2) sets colspan to 2', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'address')?.colspan).toBe(2);
  });

  test('@ReadOnly sets readOnly to true', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'readOnlyField')?.readOnly).toBe(true);
  });

  test('non-annotated fields are not readOnly', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'name')?.readOnly).toBeFalsy();
    expect(fields.find((f: any) => f.fieldId === 'email')?.readOnly).toBeFalsy();
  });

  test('submit button is present', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, { route: '/', actionId: '__load__' });
    const buttons = allButtons(body.fragments);
    expect(buttons.find((b: any) => b.actionId === 'submit')).toBeDefined();
  });

  test('submit action returns a success message', async ({ request }) => {
    const body = await callAction(request, FIELD_ANN_API, {
      route: '/',
      actionId: 'submit',
      componentState: { name: 'Alice' },
      serverSideType: 'io.mateu.sample1.FieldAnnotationsForm',
    });
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].variant).toBe('success');
    expect(body.messages[0].text).toBe('Submitted!');
  });

});

// ---------------------------------------------------------------------------
// ValidationForm — /validation
// ---------------------------------------------------------------------------

const VALIDATION_API = '/validation/mateu/v3/components/_/action';

test.describe('ValidationForm — bean validation', () => {

  test('load returns title "Validation Form"', async ({ request }) => {
    const body = await callAction(request, VALIDATION_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Validation Form');
  });

  test('@NotEmpty String sets required=true', async ({ request }) => {
    const body = await callAction(request, VALIDATION_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const f = fields.find((f: any) => f.fieldId === 'requiredText');
    expect(f?.required).toBe(true);
    expect(f?.dataType).toBe('string');
  });

  test('@NotNull LocalDate sets required=true', async ({ request }) => {
    const body = await callAction(request, VALIDATION_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const f = fields.find((f: any) => f.fieldId === 'requiredDate');
    expect(f?.required).toBe(true);
    expect(f?.dataType).toBe('date');
  });

  test('@Min/@Max int is not required by default', async ({ request }) => {
    const body = await callAction(request, VALIDATION_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'rangedInt')?.required).toBe(false);
  });

  test('validate action returns success message', async ({ request }) => {
    const body = await callAction(request, VALIDATION_API, {
      route: '/',
      actionId: 'validate',
      componentState: { requiredText: 'hello', rangedInt: 50 },
      serverSideType: 'io.mateu.sample1.ValidationForm',
    });
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].text).toBe('Valid!');
  });

});

// ---------------------------------------------------------------------------
// SectionsForm — /sections
// ---------------------------------------------------------------------------

const SECTIONS_API = '/sections/mateu/v3/components/_/action';

test.describe('SectionsForm — @Section grouping', () => {

  test('load returns title "Sections Form"', async ({ request }) => {
    const body = await callAction(request, SECTIONS_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Sections Form');
  });

  test('all 4 fields are present', async ({ request }) => {
    const body = await callAction(request, SECTIONS_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const ids = fields.map((f: any) => f.fieldId);
    expect(ids).toContain('firstName');
    expect(ids).toContain('lastName');
    expect(ids).toContain('phone');
    expect(ids).toContain('city');
  });

  test('fields are grouped into 2 sections (not 4)', async ({ request }) => {
    const body = await callAction(request, SECTIONS_API, { route: '/', actionId: '__load__' });
    // Sections appear as Card components; count distinct cards that have fields
    const nodes = body.fragments.flatMap((f: any) => allNodes(f.component));
    const sectionTitles = nodes
      .filter((n: any) => n?.metadata?.type === 'Text' && n?.metadata?.container === 'h3')
      .map((n: any) => n.metadata.text);
    const unique = [...new Set(sectionTitles)];
    expect(unique).toContain('Personal Info');
    expect(unique).toContain('Contact');
    expect(unique).toHaveLength(2);
  });

  test('save button is present', async ({ request }) => {
    const body = await callAction(request, SECTIONS_API, { route: '/', actionId: '__load__' });
    expect(allButtons(body.fragments).find((b: any) => b.actionId === 'save')).toBeDefined();
  });

  test('save returns a success message', async ({ request }) => {
    const body = await callAction(request, SECTIONS_API, {
      route: '/', actionId: 'save',
      componentState: { firstName: 'Alice', lastName: 'Smith', phone: '123', city: 'NYC' },
      serverSideType: 'io.mateu.sample1.SectionsForm',
    });
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].text).toBe('Saved!');
  });

});

// ---------------------------------------------------------------------------
// TabsForm — /tabs
// ---------------------------------------------------------------------------

const TABS_API = '/tabs/mateu/v3/components/_/action';

test.describe('TabsForm — @Tabs / @Tab layout', () => {

  test('load returns title "Tabs Form"', async ({ request }) => {
    const body = await callAction(request, TABS_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Tabs Form');
  });

  test('response contains Tab components with "Personal" and "Address" labels', async ({ request }) => {
    const body = await callAction(request, TABS_API, { route: '/', actionId: '__load__' });
    const nodes = body.fragments.flatMap((f: any) => allNodes(f.component));
    const tabLabels = nodes
      .filter((n: any) => n?.metadata?.type === 'Tab')
      .map((n: any) => n.metadata.label);
    expect(tabLabels).toContain('Personal');
    expect(tabLabels).toContain('Address');
    expect(tabLabels).toHaveLength(2);
  });

  test('fields from both tabs are all accessible', async ({ request }) => {
    const body = await callAction(request, TABS_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const ids = fields.map((f: any) => f.fieldId);
    expect(ids).toContain('firstName');
    expect(ids).toContain('lastName');
    expect(ids).toContain('street');
    expect(ids).toContain('city');
  });

  test('save button is present', async ({ request }) => {
    const body = await callAction(request, TABS_API, { route: '/', actionId: '__load__' });
    expect(allButtons(body.fragments).find((b: any) => b.actionId === 'save')).toBeDefined();
  });

  test('save returns success message', async ({ request }) => {
    const body = await callAction(request, TABS_API, {
      route: '/', actionId: 'save',
      componentState: { firstName: 'A', lastName: 'B', street: 'C', city: 'D' },
      serverSideType: 'io.mateu.sample1.TabsForm',
    });
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].text).toBe('Saved!');
  });

});

// ---------------------------------------------------------------------------
// AccordionForm — /accordion
// ---------------------------------------------------------------------------

const ACCORDION_API = '/accordion/mateu/v3/components/_/action';

test.describe('AccordionForm — @Accordion layout', () => {

  test('load returns title "Accordion Form"', async ({ request }) => {
    const body = await callAction(request, ACCORDION_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Accordion Form');
    expect(body.messages).toHaveLength(0);
  });

  test('all 4 fields are present', async ({ request }) => {
    const body = await callAction(request, ACCORDION_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const ids = fields.map((f: any) => f.fieldId);
    expect(ids).toContain('name');
    expect(ids).toContain('email');
    expect(ids).toContain('description');
    expect(ids).toContain('priority');
  });

  test('save action is present in buttons', async ({ request }) => {
    const body = await callAction(request, ACCORDION_API, { route: '/', actionId: '__load__' });
    expect(allButtons(body.fragments).find((b: any) => b.actionId === 'save')).toBeDefined();
  });

  test('save returns success message', async ({ request }) => {
    const body = await callAction(request, ACCORDION_API, {
      route: '/', actionId: 'save',
      componentState: { name: 'Test', email: 'test@test.com', description: 'desc', priority: 1 },
      serverSideType: 'io.mateu.sample1.AccordionForm',
    });
    expect(body.messages[0].text).toBe('Saved!');
  });

});

// ---------------------------------------------------------------------------
// MultiColumnForm — /multi-column
// ---------------------------------------------------------------------------

const MULTI_COL_API = '/multi-column/mateu/v3/components/_/action';

test.describe('MultiColumnForm — @FormLayout(columns=3)', () => {

  test('load returns title "Multi Column Form" with 6 fields', async ({ request }) => {
    const body = await callAction(request, MULTI_COL_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Multi Column Form');
    const fields = allFields(body.fragments);
    expect(fields).toHaveLength(6);
  });

  test('FormLayout has maxColumns=3', async ({ request }) => {
    const body = await callAction(request, MULTI_COL_API, { route: '/', actionId: '__load__' });
    const nodes = body.fragments.flatMap((f: any) => allNodes(f.component));
    const formLayout = nodes.find((n: any) => n?.metadata?.type === 'FormLayout');
    expect(formLayout?.metadata?.maxColumns).toBe(3);
  });

  test('all 6 fields are string type', async ({ request }) => {
    const body = await callAction(request, MULTI_COL_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    for (const f of fields) {
      expect(f.dataType).toBe('string');
    }
  });

});

// ---------------------------------------------------------------------------
// InlineForm — /inline
// ---------------------------------------------------------------------------

const INLINE_API = '/inline/mateu/v3/components/_/action';

test.describe('InlineForm — @Inline nested type', () => {

  test('load returns title "Inline Form"', async ({ request }) => {
    const body = await callAction(request, INLINE_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Inline Form');
  });

  test('inline fields appear with prefixed fieldIds', async ({ request }) => {
    const body = await callAction(request, INLINE_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const ids = fields.map((f: any) => f.fieldId);
    expect(ids).toContain('mainName');
    expect(ids).toContain('address-street');
    expect(ids).toContain('address-city');
    expect(ids).toContain('address-country');
  });

  test('all inline fields are string type', async ({ request }) => {
    const body = await callAction(request, INLINE_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    for (const f of fields) {
      expect(f.dataType).toBe('string');
    }
  });

  test('save action returns success message', async ({ request }) => {
    const body = await callAction(request, INLINE_API, {
      route: '/', actionId: 'save',
      componentState: { mainName: 'Test', address: { street: 'Main St', city: 'NYC', country: 'US' } },
      serverSideType: 'io.mateu.sample1.InlineForm',
    });
    expect(body.messages[0].text).toBe('Saved!');
  });

});

// ---------------------------------------------------------------------------
// PlainTextForm — /plain-text
// ---------------------------------------------------------------------------

const PLAIN_TEXT_API = '/plain-text/mateu/v3/components/_/action';

test.describe('PlainTextForm — @PlainText stereotype', () => {

  test('load returns title "Plain Text Form"', async ({ request }) => {
    const body = await callAction(request, PLAIN_TEXT_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Plain Text Form');
  });

  test('@PlainText String field has stereotype "plainText"', async ({ request }) => {
    const body = await callAction(request, PLAIN_TEXT_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'displayName')?.stereotype).toBe('plainText');
  });

  test('@PlainText int field has stereotype "plainText"', async ({ request }) => {
    const body = await callAction(request, PLAIN_TEXT_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'displayCount')?.stereotype).toBe('plainText');
  });

  test('non-annotated field is not plainText', async ({ request }) => {
    const body = await callAction(request, PLAIN_TEXT_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'editableField')?.stereotype).toBe('regular');
  });

  test('update action returns success message', async ({ request }) => {
    const body = await callAction(request, PLAIN_TEXT_API, {
      route: '/', actionId: 'update',
      serverSideType: 'io.mateu.sample1.PlainTextForm',
    });
    expect(body.messages[0].text).toBe('Updated!');
  });

});

// ---------------------------------------------------------------------------
// BannerDemoForm — /banners
// ---------------------------------------------------------------------------

const BANNERS_API = '/banners/mateu/v3/components/_/action';

test.describe('BannerDemoForm — @Banner', () => {

  test('load returns title "Banner Demo Form"', async ({ request }) => {
    const body = await callAction(request, BANNERS_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Banner Demo Form');
  });

  test('page has 2 banners', async ({ request }) => {
    const body = await callAction(request, BANNERS_API, { route: '/', actionId: '__load__' });
    const page = pageMetadata(body.fragments);
    expect(page?.banners).toHaveLength(2);
  });

  test('info banner has theme INFO and correct title', async ({ request }) => {
    const body = await callAction(request, BANNERS_API, { route: '/', actionId: '__load__' });
    const page = pageMetadata(body.fragments);
    const info = page?.banners?.find((b: any) => b.theme === 'INFO');
    expect(info).toBeDefined();
    expect(info?.title).toBe('Info Banner');
    expect(info?.description).toBe('This is an informational message.');
  });

  test('warning banner has theme WARNING and correct title', async ({ request }) => {
    const body = await callAction(request, BANNERS_API, { route: '/', actionId: '__load__' });
    const page = pageMetadata(body.fragments);
    const warn = page?.banners?.find((b: any) => b.theme === 'WARNING');
    expect(warn).toBeDefined();
    expect(warn?.title).toBe('Warning Banner');
  });

  test('save action returns success message', async ({ request }) => {
    const body = await callAction(request, BANNERS_API, {
      route: '/', actionId: 'save',
      serverSideType: 'io.mateu.sample1.BannerDemoForm',
    });
    expect(body.messages[0].text).toBe('Saved!');
  });

});

// ---------------------------------------------------------------------------
// FabDemoForm — /fab
// ---------------------------------------------------------------------------

const FAB_API = '/fab/mateu/v3/components/_/action';

test.describe('FabDemoForm — @Fab floating action buttons', () => {

  test('load returns title "FAB Demo Form"', async ({ request }) => {
    const body = await callAction(request, FAB_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('FAB Demo Form');
  });

  test('page has 2 FABs', async ({ request }) => {
    const body = await callAction(request, FAB_API, { route: '/', actionId: '__load__' });
    const page = pageMetadata(body.fragments);
    expect(page?.fabs).toHaveLength(2);
  });

  test('addItem FAB has correct actionId and icon', async ({ request }) => {
    const body = await callAction(request, FAB_API, { route: '/', actionId: '__load__' });
    const page = pageMetadata(body.fragments);
    const fab = page?.fabs?.find((f: any) => f.actionId === 'addItem');
    expect(fab).toBeDefined();
    expect(fab?.icon).toBe('vaadin:plus');
  });

  test('editItem FAB has correct actionId', async ({ request }) => {
    const body = await callAction(request, FAB_API, { route: '/', actionId: '__load__' });
    const page = pageMetadata(body.fragments);
    const fab = page?.fabs?.find((f: any) => f.actionId === 'editItem');
    expect(fab).toBeDefined();
    expect(fab?.icon).toBe('vaadin:edit');
  });

  test('addItem FAB action returns success message', async ({ request }) => {
    const body = await callAction(request, FAB_API, {
      route: '/', actionId: 'addItem',
      serverSideType: 'io.mateu.sample1.FabDemoForm',
    });
    expect(body.messages[0].text).toBe('Item added!');
  });

  test('editItem FAB action returns success message', async ({ request }) => {
    const body = await callAction(request, FAB_API, {
      route: '/', actionId: 'editItem',
      serverSideType: 'io.mateu.sample1.FabDemoForm',
    });
    expect(body.messages[0].text).toBe('Item edited!');
  });

  test('FABs are ordered: addItem first, editItem second', async ({ request }) => {
    const body = await callAction(request, FAB_API, { route: '/', actionId: '__load__' });
    const page = pageMetadata(body.fragments);
    const fabs = page?.fabs ?? [];
    expect(fabs[0]?.actionId).toBe('addItem');
    expect(fabs[1]?.actionId).toBe('editItem');
  });

});

// ---------------------------------------------------------------------------
// KpiDemoForm — /kpi
// ---------------------------------------------------------------------------

const KPI_API = '/kpi/mateu/v3/components/_/action';

test.describe('KpiDemoForm — @KPI fields', () => {

  test('load returns title "KPI Demo Form"', async ({ request }) => {
    const body = await callAction(request, KPI_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('KPI Demo Form');
  });

  test('page has 3 KPIs', async ({ request }) => {
    const body = await callAction(request, KPI_API, { route: '/', actionId: '__load__' });
    const page = pageMetadata(body.fragments);
    expect(page?.kpis).toHaveLength(3);
  });

  test('KPIs have correct titles', async ({ request }) => {
    const body = await callAction(request, KPI_API, { route: '/', actionId: '__load__' });
    const page = pageMetadata(body.fragments);
    const titles = page?.kpis?.map((k: any) => k.title) ?? [];
    expect(titles).toContain('Total users');
    expect(titles).toContain('Active orders');
    expect(titles).toContain('Revenue');
  });

  test('KPIs have correct text values', async ({ request }) => {
    const body = await callAction(request, KPI_API, { route: '/', actionId: '__load__' });
    const page = pageMetadata(body.fragments);
    const byTitle = (t: string) => page?.kpis?.find((k: any) => k.title === t);
    expect(byTitle('Total users')?.text).toBe('1,234');
    expect(byTitle('Active orders')?.text).toBe('56');
    expect(byTitle('Revenue')?.text).toBe('$12,500');
  });

  test('@KPI fields are excluded from the form body', async ({ request }) => {
    const body = await callAction(request, KPI_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const ids = fields.map((f: any) => f.fieldId);
    expect(ids).not.toContain('totalUsers');
    expect(ids).not.toContain('activeOrders');
    expect(ids).not.toContain('revenue');
    expect(ids).toContain('searchQuery');
  });

  test('refresh action returns success', async ({ request }) => {
    const body = await callAction(request, KPI_API, {
      route: '/', actionId: 'refresh',
      serverSideType: 'io.mateu.sample1.KpiDemoForm',
    });
    expect(body.messages[0].text).toBe('Refreshed!');
  });

});

// ---------------------------------------------------------------------------
// ZonesForm — /zones
// ---------------------------------------------------------------------------

const ZONES_API = '/zones/mateu/v3/components/_/action';

test.describe('ZonesForm — @Zones / @Zone layout', () => {

  test('load returns title "Zones Form"', async ({ request }) => {
    const body = await callAction(request, ZONES_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Zones Form');
  });

  test('all 4 fields are present', async ({ request }) => {
    const body = await callAction(request, ZONES_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const ids = fields.map((f: any) => f.fieldId);
    expect(ids).toContain('leftField1');
    expect(ids).toContain('leftField2');
    expect(ids).toContain('rightField1');
    expect(ids).toContain('rightField2');
  });

  test('save returns success message', async ({ request }) => {
    const body = await callAction(request, ZONES_API, {
      route: '/', actionId: 'save',
      serverSideType: 'io.mateu.sample1.ZonesForm',
    });
    expect(body.messages[0].text).toBe('Saved!');
  });

});

// ---------------------------------------------------------------------------
// CatalogNotCreatable — /catalog-read-only (AutoCrud with constraints)
// ---------------------------------------------------------------------------

const CATALOG_RO_API = '/catalog-read-only/mateu/v3/components/_/action';

test.describe('CatalogNotCreatable — @NotCreatable @NotEditable @NotDeletable', () => {

  test('search returns data without errors', async ({ request }) => {
    const body = await callAction(request, CATALOG_RO_API, {
      route: '/', actionId: 'search',
      serverSideType: 'io.mateu.sample1.app.CatalogNotCreatable',
      consumedRoute: '',
      componentState: { page: 0, size: 10 },
    });
    expect(body.fragments.length).toBeGreaterThan(0);
    expect(body.messages).toHaveLength(0);
  });

  test('search returns 2 products', async ({ request }) => {
    const body = await callAction(request, CATALOG_RO_API, {
      route: '/', actionId: 'search',
      serverSideType: 'io.mateu.sample1.app.CatalogNotCreatable',
      consumedRoute: '',
      componentState: { page: 0, size: 10 },
    });
    const content = body.fragments[0]?.data?.crud?.page?.content ?? [];
    expect(content.length).toBe(2);
  });

  test('products have id, name and price fields', async ({ request }) => {
    const body = await callAction(request, CATALOG_RO_API, {
      route: '/', actionId: 'search',
      serverSideType: 'io.mateu.sample1.app.CatalogNotCreatable',
      consumedRoute: '',
      componentState: { page: 0, size: 10 },
    });
    const content = body.fragments[0]?.data?.crud?.page?.content ?? [];
    for (const product of content) {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(typeof product.price).toBe('number');
    }
  });

});

// ---------------------------------------------------------------------------
// FilterableCatalog — /catalog-filterable
// ---------------------------------------------------------------------------

const FILTERABLE_API = '/catalog-filterable/mateu/v3/components/_/action';

test.describe('FilterableCatalog — @Filterable columns', () => {

  test('search returns all 3 employees', async ({ request }) => {
    const body = await callAction(request, FILTERABLE_API, {
      route: '/', actionId: 'search',
      serverSideType: 'io.mateu.sample1.app.FilterableCatalog',
      consumedRoute: '',
      componentState: { page: 0, size: 10 },
    });
    expect(body.messages).toHaveLength(0);
    const content = body.fragments[0]?.data?.crud?.page?.content ?? [];
    expect(content.length).toBe(3);
  });

  test('employee records have name and department', async ({ request }) => {
    const body = await callAction(request, FILTERABLE_API, {
      route: '/', actionId: 'search',
      serverSideType: 'io.mateu.sample1.app.FilterableCatalog',
      consumedRoute: '',
      componentState: { page: 0, size: 10 },
    });
    const content = body.fragments[0]?.data?.crud?.page?.content ?? [];
    const names = content.map((e: any) => e.name);
    expect(names).toContain('Alice');
    expect(names).toContain('Bob');
    expect(names).toContain('Carol');
  });

});

// ---------------------------------------------------------------------------
// RegistrationWizard — /wizard
// ---------------------------------------------------------------------------

const WIZARD_API = '/wizard/mateu/v3/components/_/action';

test.describe('RegistrationWizard — Wizard', () => {

  test('load returns wizard component without errors', async ({ request }) => {
    const body = await callAction(request, WIZARD_API, { route: '/', actionId: '__load__' });
    expect(body.messages).toHaveLength(0);
    expect(body.fragments.length).toBeGreaterThan(0);
    // Wizard title appears as a Text element (h2) in the component tree
    const nodes = body.fragments.flatMap((f: any) => allNodes(f.component));
    const titleText = nodes.find((n: any) =>
      n?.metadata?.type === 'Text' && n?.metadata?.container === 'h2'
    );
    expect(titleText?.metadata?.text).toBe('Registration Wizard');
  });

  test('first step shows name and email fields', async ({ request }) => {
    const body = await callAction(request, WIZARD_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const ids = fields.map((f: any) => f.fieldId);
    expect(ids).toContain('name');
    expect(ids).toContain('email');
  });

  test('first step name field is required', async ({ request }) => {
    const body = await callAction(request, WIZARD_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const name = fields.find((f: any) => f.fieldId === 'name');
    expect(name?.required).toBe(true);
  });

  test('first step has a ProgressBar', async ({ request }) => {
    const body = await callAction(request, WIZARD_API, { route: '/', actionId: '__load__' });
    const nodes = body.fragments.flatMap((f: any) => allNodes(f.component));
    const progress = nodes.find((n: any) => n?.metadata?.type === 'ProgressBar');
    expect(progress).toBeDefined();
  });

});
