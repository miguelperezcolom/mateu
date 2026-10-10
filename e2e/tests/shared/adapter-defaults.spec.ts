import { test, expect } from '@playwright/test';

// The secure defaults every adapter must ship with (shared suite → all five): no cross-origin access
// unless mateu.cors.allowed-origins lists the origin, and no MCP endpoint unless mateu.mcp.enabled.
// The generated controllers used to carry a bare @CrossOrigin (Spring) or allow any origin with
// credentials (Micronaut), so any web page could drive a Mateu app from the user's browser.
test.describe('adapter defaults', () => {

  for (const path of ['/mateu/v3/sync/long-task', '/mateu/v3/sse/long-task']) {
    test(`a preflight from a foreign origin is not granted (${path})`, async ({ request }) => {
      const response = await request.fetch(path, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://evil.example',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
        },
      });
      expect(response.headers()['access-control-allow-origin']).toBeUndefined();
      expect(response.headers()['access-control-allow-credentials']).toBeUndefined();
    });
  }

  test('an actual cross-origin call carries no CORS headers', async ({ request }) => {
    const response = await request.post('/mateu/v3/sync/long-task', {
      headers: { Origin: 'https://evil.example' },
      data: { route: '/long-task', actionId: '', componentState: {}, parameters: {}, appState: {} },
    });
    expect(response.headers()['access-control-allow-origin']).toBeUndefined();
  });

  test('the MCP endpoint is off', async ({ request }) => {
    const response = await request.post('/mateu/mcp', {
      data: { jsonrpc: '2.0', id: 1, method: 'initialize' },
    });
    expect(response.status()).not.toBe(200);
  });

});
