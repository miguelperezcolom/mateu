/**
 * Capability negotiation across the embedding boundary.
 *
 * A host embeds a Mateu app served by a possibly-different backend. The honest compatibility
 * question is not "which version?" but "does the loaded renderer implement everything this app
 * relies on?". The app advertises what it REQUIRES (`AppDto.requiredCapabilities`, mostly derived
 * from its own metadata); this build advertises what it PROVIDES. On boot the shell compares them
 * and surfaces what is MISSING, instead of rendering a subtly broken screen. A newer app needing a
 * token an older renderer bundle does not provide is exactly what this catches — a version number
 * could not, because it says nothing about which features a build actually implements.
 *
 * The token vocabulary is the contract shared with the backends (`io.mateu.uidl.Capabilities`, the
 * .NET `Capabilities` and the Python `capabilities`); keep the four in step. Adding a token is
 * additive; never rename or repurpose one, or an old app would mean something different to a new host.
 */

/** Every capability this renderer build implements. */
export const PROVIDED_CAPABILITIES: ReadonlySet<string> = new Set([
  'sse',
  'app-data',
  'rest-sources',
  'command-center',
  'global-search',
  'notifications',
  'context-selectors',
  'header-actions',
])

export interface CapabilityCheck {
  /** True when this build provides every capability the app requires. */
  ok: boolean
  /** The required tokens this build does NOT provide, in the order given. */
  missing: string[]
}

/**
 * Compare what an app requires against what this build provides. An unknown/empty requirement list
 * is trivially satisfied. `provided` is injectable so it can be tested against a synthetic build.
 */
export function checkCapabilities(
  required: readonly string[] | undefined | null,
  provided: ReadonlySet<string> = PROVIDED_CAPABILITIES,
): CapabilityCheck {
  const missing = (required ?? []).filter((c) => c && !provided.has(c))
  return { ok: missing.length === 0, missing }
}

/**
 * Run the check for an app and, when something is missing, WARN and dispatch a
 * `mateu-capability-mismatch` event (bubbling + composed) so a host page can react (e.g. show its
 * own message, load a newer renderer, or block). Never throws and never blocks rendering — a
 * degraded screen the user is told about beats a silent broken one. Returns the check result.
 */
export function announceCapabilityMismatch(
  required: readonly string[] | undefined | null,
  source: EventTarget = document,
): CapabilityCheck {
  const result = checkCapabilities(required)
  if (!result.ok) {
    console.warn(
      `[mateu] this renderer is missing capabilities the app requires: ${result.missing.join(', ')}. ` +
        `The app may not render correctly. Load a renderer build that provides them.`,
    )
    source.dispatchEvent(
      new CustomEvent('mateu-capability-mismatch', {
        detail: { missing: result.missing, required: [...(required ?? [])] },
        bubbles: true,
        composed: true,
      }),
    )
  }
  return result
}
