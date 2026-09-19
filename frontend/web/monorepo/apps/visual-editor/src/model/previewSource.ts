import { InferredField } from './layoutDelta'
import { ContractMembers } from './contract'

/**
 * The preview source (visual-editor Phase 2): where the canvas gets its RENDER and its DATA from,
 * as a configurable choice instead of the single fixed host `baseUrl`.
 *
 * The split that governs everything (see design/visual-builder-vb-mapping.md, pillar 4):
 *   - RENDERING the layout (`__preview__`) is a pure function of the edited YAML — it needs an actual
 *     renderer, so it can't be served by static fixtures. A backend runs it (`__preview__` renders the
 *     layout with NO data binding, so any Mateu backend works — you don't need the app's data source).
 *   - DATA + contract (`__contract__`, listing rows, options) is the classic mocking case — fixtures,
 *     recorded or AI-generated from the ViewModels.
 *
 * Modes (none require a paid cloud):
 *   - `remote`  point at any running backend (dev/staging/demo). Render + real data. (today's behaviour)
 *   - `local`   the same, but the backend is an embedded/loopback Mateu (semantically distinct so the
 *               UI can say "offline"); for the web client it is still just a baseUrl.
 *   - `mock`    contract/data come from FIXTURES (works with no data source); render still uses `baseUrl`.
 *   - `client`  render client-side with no backend (coherence Phase 6 expander) — NOT built yet; the
 *               model carries the mode so the UI/serialisation are ready, but `renderBaseUrl` is empty.
 */
export type PreviewMode = 'remote' | 'local' | 'mock' | 'client'

/** A mocked `__contract__` response for one ModelView: the members its bindings can resolve against. */
export interface ContractFixture {
    fields?: InferredField[]
    /** Action ids a Button can bind to. */
    actions?: string[]
}

export interface PreviewSource {
    mode: PreviewMode
    /** Render + fallback backend for `remote`/`local`/`mock`. Ignored (empty render) for `client`. */
    baseUrl: string
    /** `mock`-mode contract fixtures, keyed by ModelView FQN. */
    contractFixtures?: Record<string, ContractFixture>
}

export const PREVIEW_MODES: readonly PreviewMode[] = ['remote', 'local', 'mock', 'client'] as const

/** A short, human label per mode for the selector UI. */
export const PREVIEW_MODE_LABELS: Record<PreviewMode, string> = {
    remote: 'Remote backend',
    local: 'Local backend',
    mock: 'Mock data',
    client: 'Client-side (no backend)',
}

/** The default: point at whatever backend the host handed us, live. */
export function defaultPreviewSource(baseUrl: string): PreviewSource {
    return { mode: 'remote', baseUrl }
}

/**
 * The baseUrl `__preview__` should render against. Empty string = "no render backend" — only `client`
 * mode, which has no renderer yet, so the canvas shows a placeholder instead of calling a dead URL.
 */
export function renderBaseUrl(src: PreviewSource): string {
    return src.mode === 'client' ? '' : src.baseUrl
}

/** True when the canvas cannot render because the chosen mode has no backend (today: only `client`). */
export function rendersClientSide(src: PreviewSource): boolean {
    return src.mode === 'client'
}

/** True when contract/data are served from fixtures rather than the backend. */
export function usesFixtures(src: PreviewSource): boolean {
    return src.mode === 'mock'
}

/** The contract fixture for a model view, when the source is `mock` and carries one; else null. */
export function contractFixtureFor(src: PreviewSource, modelView: string | undefined): ContractFixture | null {
    if (!usesFixtures(src) || !modelView) return null
    return src.contractFixtures?.[modelView] ?? null
}

/** A fixture reshaped as the {@link ContractMembers} the binding pickers consume (ids only). */
export function fixtureAsMembers(fixture: ContractFixture): ContractMembers {
    return {
        fields: (fixture.fields ?? []).map((f) => f.id).filter((id): id is string => !!id),
        actions: (fixture.actions ?? []).filter((id): id is string => typeof id === 'string' && !!id),
    }
}

// --- persistence (pure serialise/parse; the store owns localStorage) ---

export function serializePreviewSource(src: PreviewSource): string {
    return JSON.stringify(src)
}

/**
 * Parse a persisted preview source, tolerating anything malformed by falling back to `remote` at the
 * given baseUrl. A persisted `baseUrl` is only kept for modes that carry one; otherwise the live host
 * baseUrl wins (so moving the project between backends does the right thing).
 */
export function parsePreviewSource(raw: string | null | undefined, fallbackBaseUrl: string): PreviewSource {
    if (!raw) return defaultPreviewSource(fallbackBaseUrl)
    try {
        const parsed = JSON.parse(raw) as Partial<PreviewSource>
        const mode = PREVIEW_MODES.includes(parsed.mode as PreviewMode) ? (parsed.mode as PreviewMode) : 'remote'
        return {
            mode,
            baseUrl: typeof parsed.baseUrl === 'string' && parsed.baseUrl ? parsed.baseUrl : fallbackBaseUrl,
            contractFixtures:
                parsed.contractFixtures && typeof parsed.contractFixtures === 'object'
                    ? parsed.contractFixtures
                    : undefined,
        }
    } catch {
        return defaultPreviewSource(fallbackBaseUrl)
    }
}
