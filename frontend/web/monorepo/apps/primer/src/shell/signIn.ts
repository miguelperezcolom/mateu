/**
 * The web's BUILT-IN sign-in (the page's `<meta name="mateu-auth">`, served by the backend from its
 * sign-in providers) on this renderer: the very same flows as the Vaadin renderer — libs/mateu
 * infra/auth (OIDC code + PKCE, redirect providers, the token cookie authToken.ts keeps) — handed
 * to the React Native core as its TokenProvider, so every Mateu call carries the Bearer token and a
 * 401 is answered by a refresh, then a new sign-in. Only the chooser is Primer's (SignInChooser.tsx).
 *
 * Mateu still authenticates nobody: the page names the providers, the IdP signs the user in and the
 * backend's framework verifies the token. A page without the meta pays one querySelector: the flows
 * are a chunk of their own (signInBridge.ts).
 */

let bridge: typeof import('./signInBridge') | undefined

/** Resolves whether the app may load now (false while the user is sent to a provider or picks one). */
export async function primerSignIn(baseUrl: string): Promise<boolean> {
  if (!document.querySelector('meta[name="mateu-auth"]')) return true
  try {
    bridge = await import('./signInBridge')
    return await bridge.start(baseUrl)
  } catch (error) {
    console.warn('mateu: the built-in sign-in failed to start; loading the app without it', error)
    return true
  }
}

/** Whether the built-in sign-in holds a session (then "Sign out" applies). */
export const builtInSignOutAvailable = (): boolean => !!bridge && bridge.signOutAvailable()

/** Signs out of the built-in sign-in (tokens dropped, then the IdP's or the framework's logout). */
export const signOutOfBuiltIn = async (): Promise<void> => { await bridge?.builtInSignOut() }
