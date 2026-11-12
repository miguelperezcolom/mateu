import { hasAuthTokenProvider } from '@infra/http/authToken.ts'
import { setBuiltInSessionExpiredHandler } from '@infra/http/sessionGuard.ts'
import { hasBuiltInSession } from './authSession.ts'
import { readSignInConfig, SignInConfig } from './signInConfig.ts'

/**
 * The entry of the built-in sign-in, in the eager bundle and kept tiny: it reads the page's
 * `<meta name="mateu-auth">` and, only when there is one, loads the flows (signInFlow.ts) and the
 * chooser. A page without the meta pays one querySelector.
 *
 * An app that brings its own sign-in keeps it: `configureAuthToken({ provider })` turns the built-in
 * off, and an `onSessionExpired` handler or a claimed `mateu-session-expired` event still answers
 * a 401 before it (sessionGuard.ts).
 */

let active: { config: SignInConfig, baseUrl: string } | undefined

const flow = () => import('./signInFlow.ts')

/**
 * Called once by the top-level `<mateu-ui>` BEFORE its first load. Null when the page declares no
 * providers (the app loads as before); else a promise of whether the app may load now (false while
 * the user is sent to a provider or picks one).
 */
export const signInGate = (baseUrl: string): Promise<boolean> | null => {
    if (hasAuthTokenProvider()) return null
    const config = readSignInConfig()
    if (!config) return null
    active = { config, baseUrl }
    setBuiltInSessionExpiredHandler((context) => {
        flow().then((m) => m.reauthenticate(context, config, baseUrl), () => context.giveUp())
    })
    return flow().then((m) => m.bootSignIn(config, baseUrl)).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn('mateu: the built-in sign-in failed to start; loading the app without it', error)
        return true
    })
}

/** Whether "Sign out" applies: the built-in sign-in is on and holds a session. */
export const signOutAvailable = (): boolean => !!active && hasBuiltInSession()

/**
 * Signs out of the built-in sign-in (tokens dropped, then the IdP's or the framework's logout).
 * Without the built-in it only drops the stored token and reloads.
 */
export const signOut = async (): Promise<void> => {
    if (active) {
        await (await flow()).signOut(active.config, active.baseUrl)
        return
    }
    const { setAuthToken } = await import('@infra/http/authToken.ts')
    setAuthToken(null)
    window.location.reload()
}

/** For tests. */
export const resetSignIn = () => {
    active = undefined
    setBuiltInSessionExpiredHandler(undefined)
}
