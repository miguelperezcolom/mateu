import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios"
import { readAppContext } from '@infra/appContextStore.ts';
import { handleSessionExpired } from '@infra/http/sessionGuard.ts';
import { loginRedirectTarget } from '@infra/http/redirectGuard.ts';
import {MateuApiClient, RunActionOptions} from "@domain/MateuApiClient";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import {ComponentState} from "@infra/ui/renderers/types.ts";
import {loopGuard} from "@infra/ui/loopGuard.ts";
import {awaitBundle, hasBundle, isForeignBaseUrl, isStaticBundleUrl, resolveBundledLoad, resolveRemoteBundledLoad, toSyncPath} from "@infra/http/bundleStore.ts";
import {classifyRequestFailure} from "@infra/http/requestPolicy.ts";
import {isIdempotentAction, retryDelayMs, shouldRetry} from "@infra/http/retryPolicy.ts";
import {connectivity} from "@infra/http/connectivity.ts";
import {reportClientError} from "@infra/http/clientErrorReporter.ts";
import {StaleResponse} from "@infra/ui/staleViewGuard.ts";
import { getAuthToken, sessionId } from '@infra/http/authToken.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { observeWireVersion } from '@infra/http/wireVersion.ts'
import { mayCarryCredentials } from '@infra/http/credentialScope.ts'
import { asAnsweredBy } from '@infra/ui/untrustedDefinition.ts'
import { resolveSafeUrl } from '@infra/ui/safeNavigate.ts'
import { rendererHeaders } from '@infra/http/rendererIdentity.ts'
import { isStaleScreenRefusal, observeMateuResponse, STALE_SCREEN } from '@infra/http/buildWatch.ts'
import { isMateuRefusal } from '@infra/http/requestPolicy.ts'

let abortControllers: AbortController[] = []

/** Default ceiling for a sync call. Overridable per action via `@Action(timeoutMillis = …)`. */
const DEFAULT_TIMEOUT_MS = 60000

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export class AxiosMateuApiClient implements MateuApiClient {

    axiosInstance = axios.create({timeout: DEFAULT_TIMEOUT_MS})

    constructor() {
        this.axiosInstance.interceptors.request.use(config => {
            // the user's credentials only go to the origins trusted with them (credentialScope.ts)
            if (!mayCarryCredentials(this.axiosInstance.getUri(config))) return config
            this.addAuthToken(config)
            // NOT held back for the duplicated-tab check (tabSession.ts): delaying the first
            // requests of a page by its wait let them overtake each other (a listing's search
            // answered before its load, a shell's title after its content's). A duplicate's very
            // first requests may still carry its original's X-Session-Id, which only names the tab;
            // what must be the tab's own — the agent channel and its pairing — waits for the check.
            this.addSessionId(config)
            return config
        })
        // Session expiry without losing work: a 401 hands control to the app's re-auth flow
        // (sessionGuard) and RETRIES the same request once after it — the original promise chain
        // resolves normally, so the in-flight action completes with the user's state intact.
        // Lost container session (basic auth / form login): the server answers the API call
        // with a 302 to the login page, which the browser follows transparently — axios sees
        // a 200 with the login page's HTML, never the 302. When the final URL differs from the
        // requested one and the body isn't JSON, send the BROWSER to that URL so the user can
        // log in again instead of the action silently doing nothing.
        this.axiosInstance.interceptors.response.use(response => {
            const requestedUrl = this.axiosInstance.getUri(response.config)
            // only OUR backends' login redirect is followed (a remote must not be able to send the
            // browser somewhere), and only to an http(s) URL
            const target = mayCarryCredentials(requestedUrl) ? resolveSafeUrl(loginRedirectTarget({
                requestedUrl,
                finalUrl: (response.request as { responseURL?: string } | undefined)?.responseURL,
                contentType: String(response.headers?.['content-type'] ?? ''),
                data: response.data,
            }))?.href : undefined
            if (target) {
                window.location.assign(target)
                // the page is navigating away — settle like a cancelled request so no
                // failure toast flashes while the browser unloads
                throw Object.assign(new Error('session lost — redirecting to ' + target), { code: 'ERR_CANCELED' })
            }
            return response
        }, (error: unknown) => {
            const axiosError = error as { response?: { status?: number }, config?: InternalAxiosRequestConfig & { __mateuRetried?: boolean, __mateuIsStale?: () => boolean } }
            if (axiosError?.response?.status === 401 && axiosError.config && !axiosError.config.__mateuRetried
                // a 401 for a view no longer on screen does not ask the user to log in again: the
                // answer would be dropped anyway (staleViewGuard.ts)
                && !axiosError.config.__mateuIsStale?.()) {
                const config = axiosError.config
                config.__mateuRetried = true
                return handleSessionExpired(error, () => this.axiosInstance.request(config))
            }
            throw error
        })
    }

    private addSessionId(config: InternalAxiosRequestConfig) {
        // never throws: blocked storage keeps the id in memory (authToken.ts)
        const id = sessionId()
        if (id) config.headers['X-Session-Id'] = id
    }

    private addAuthToken(config: InternalAxiosRequestConfig) {
        // runs on EVERY request — a blocked localStorage must not fail them all (authToken.ts)
        const token = getAuthToken()
        if (token) {
            config.headers.Authorization =  'Bearer ' + token;
        } else {
            // a retried request (the 401 re-auth path re-sends the SAME config) still carries the
            // header of its first attempt: no token now means none is sent, not the stale one
            delete config.headers.Authorization
        }
    }

    /**
     * Reports the lifecycle of one logical action on the initiator: started / succeeded /
     * cancelled / failed. Takes a THUNK rather than a running promise so the whole call —
     * including any automatic retries inside it — is a single reported outcome: one loading
     * state, one toast, however many attempts it took underneath.
     *
     * The failure event carries the classified failure and, when the caller supplied one, a
     * `retry` closure that re-runs the action end to end so the UI can offer it to the user.
     */
    async wrap<T>(call: () => Promise<T>, initiator: HTMLElement, background: boolean,
                  actionId: string, retry?: () => void, quiet = false,
                  isStale?: () => boolean): Promise<T> {
        if (!background) {
            initiator.dispatchEvent(new CustomEvent('backend-called-event', {
                bubbles: true,
                composed: true,
                detail: {
                }
            }))
        }
        // The answer to a view that is no longer on screen — success or failure — dies here: the
        // initiator is only told its run is over (its busy state goes), and the caller gets a
        // StaleResponse it drops without a word (staleViewGuard.ts).
        const dropStale = (outcome: 'answered' | 'failed'): never => {
            initiator.dispatchEvent(new CustomEvent('backend-cancelled-event', {
                bubbles: true,
                composed: true,
                detail: {
                    actionId
                }
            }))
            throw new StaleResponse(actionId, outcome)
        }
        return call().then(response => {
            if (isStale?.()) dropStale('answered')
            initiator.dispatchEvent(new CustomEvent('backend-succeeded-event', {
                bubbles: true,
                composed: true,
                detail: {
                    actionId
                }
            }))
            return response
        }, (reason: unknown) => {
            if (isStale?.()) dropStale('failed')
            const failure = classifyRequestFailure(reason, {online: connectivity.isOnline()})
            if (quiet) {
                // the caller reports it its own way (RunActionOptions.quiet)
            } else if (failure.kind == 'cancelled') {
                initiator.dispatchEvent(new CustomEvent('backend-cancelled-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        actionId
                    }
                }))
            } else {
                // Mark the error as already reported so the layer above does not raise a SECOND
                // toast for the same failure (it still reports failures of its own, e.g. while
                // applying a response that did arrive).
                if (reason && typeof reason === 'object') {
                    (reason as { __mateuReported?: boolean }).__mateuReported = true
                }
                initiator.dispatchEvent(new CustomEvent('backend-failed-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        actionId,
                        reason: this.serialize(reason),
                        failure,
                        retry
                    }
                }))
            }
            throw reason
        })
    }

    /**
     * Sends, and re-sends while the failure is transient AND the action is safe to repeat
     * ({@link shouldRetry}). Each settled attempt also teaches the connectivity tracker whether
     * the backend is reachable — a reply proves the path better than any browser flag.
     */
    private async sendWithRetry<T>(send: () => Promise<T>, idempotent: boolean, quiet = false,
                                   isStale?: () => boolean): Promise<T> {
        let attempt = 0
        for (;;) {
            try {
                const response = await send()
                if (!quiet) connectivity.noteReachable()
                return response
            } catch (error) {
                const failure = classifyRequestFailure(error, {online: connectivity.isOnline()})
                if (failure.kind == 'offline' && !quiet) {
                    connectivity.noteUnreachable()
                }
                attempt++
                // nobody is waiting for the answer of a view no longer on screen
                if (isStale?.() || !shouldRetry(failure, attempt, {idempotent})) {
                    throw error
                }
                await delay(retryDelayMs(attempt))
            }
        }
    }

    private serialize(reason: unknown) {
        if ((reason as Error)?.message) {
            return reason
        }
        return JSON.stringify(reason)
    }

    /** Forgets a settled request's controller so the abort list does not grow for the session. */
    private release(controller: AbortController) {
        abortControllers = abortControllers.filter(c => c !== controller)
    }

    async get(uri: string): Promise<AxiosResponse> {
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.get(uri, {
            signal: abortController.signal
        }).finally(() => this.release(abortController));
    }

    async post(uri: string, data: unknown, timeoutMillis?: number,
               isStale?: () => boolean): Promise<AxiosResponse<any>> {
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]
        return this.axiosInstance.post(uri, data,{
            signal: abortController.signal,
            // only Mateu's own endpoints are told who calls (rendererIdentity.ts)
            headers: rendererHeaders(),
            // read by the 401 interceptor (no re-authentication for a view no longer on screen)
            ...(isStale ? {__mateuIsStale: isStale} : {}),
            ...(timeoutMillis && timeoutMillis > 0 ? {timeout: timeoutMillis} : {})
        }).finally(() => this.release(abortController));
    }

    async abortAll() {
        abortControllers.forEach(c => c.abort());
        abortControllers = []
    }

    async runAction(baseUrl: string, route: string, consumedRoute: string,
                    actionId: string,
                    initiatorComponentId: string,
                    appState: ComponentState | undefined,
                    serverSideType: string | undefined,
                    componentState: ComponentState | undefined,
                    parameters: Record<string, unknown> | undefined,
                    initiator: HTMLElement,
                    background: boolean,
                    options: RunActionOptions = {}): Promise<UIIncrement> {
        if (route && route.startsWith('/')) {
            route = route.substring(1)
        }
        // Static-bundle mode: a route LOAD (actionId="") is answered from the pre-rendered bundle
        // instead of the backend, so the UI runs from static assets with no server. Await the
        // in-flight manifest first (the first load can fire before the fetch resolves; a no-op when
        // no bundle is loading). Actions (actionId≠"") always fall through to the backend (they need
        // server logic), and a route absent from the bundle falls through too — so a hybrid deploy
        // (bundle + backend) still works.
        // A federated STATIC remote: its base URL names a bundle manifest, not a server. Its loads
        // are answered from that manifest; there is nothing to POST anything else to.
        if (isStaticBundleUrl(baseUrl)) {
            const bundled = actionId === ''
                ? await resolveRemoteBundledLoad(baseUrl, toSyncPath(route), consumedRoute)
                : undefined
            const answer = (): Promise<UIIncrement> => bundled
                ? Promise.resolve(asAnsweredBy(baseUrl, {
                    ...bundled,
                    fragments: (bundled.fragments ?? []).map(f =>
                        f.targetComponentId ? f : { ...f, targetComponentId: initiatorComponentId }),
                }))
                : Promise.reject(new Error(actionId === ''
                    ? `the static bundle ${baseUrl} does not answer the route "${route}"`
                    : `the static bundle ${baseUrl} has no server to run "${actionId}"`))
            return await this.wrap<UIIncrement>(answer, initiator, background, actionId, options.retry,
                false, options.isStale)
        }
        // The page's own bundle answers its own loads, never a federated remote's (another origin):
        // that one would get the shell's own app back as "its" menu.
        if (actionId === '' && !isForeignBaseUrl(baseUrl)) {
            await awaitBundle()
            if (hasBundle()) {
                // exact match first, then a :param template (e.g. orders/42 → the orders/:id
                // template, with the extracted params injected into the structure's state/data),
                // then — specs mode (Phase 6) — a definition-only route expanded client-side. The
                // consumed route tells a fresh load (→ the app shell, aimed at the route) from the
                // shell filling its content slot (→ the route's own screen) — see #557.
                const bundled = resolveBundledLoad(toSyncPath(route), consumedRoute)
                if (bundled) {
                    // The exporter had no initiatorComponentId, so the pre-rendered fragments carry
                    // a null target. The client only applies fragments whose targetComponentId is a
                    // live component (the top ux), so re-target the untargeted ones to this request's
                    // initiator — exactly what the server echoes on a live load.
                    const retargeted: UIIncrement = {
                        ...bundled,
                        fragments: (bundled.fragments ?? []).map(f =>
                            f.targetComponentId ? f : { ...f, targetComponentId: initiatorComponentId }),
                    }
                    return await this.wrap<UIIncrement>(
                        () => Promise.resolve(retargeted), initiator, background, actionId, options.retry,
                        false, options.isStale)
                }
            }
        }
        // Circuit breaker: a self-remounting federated mount can fire the SAME request in a tight
        // loop, hammering the server and freezing the UI. When an identical request repeats past
        // the threshold within a short window, abort the in-flight storm and return an empty
        // increment (no fragment → nothing re-renders → the loop dies), surfacing one error toast.
        const loopSignature = [baseUrl, route, consumedRoute, serverSideType ?? '', actionId,
            initiatorComponentId].join('')
        const loop = loopGuard.check(loopSignature)
        if (loop.blocked) {
            await this.abortAll()
            if (loop.firstTrip) {
                console.error('[mateu] request loop detected — aborting repeated request', loopSignature)
                reportClientError({ kind: 'request-loop', message: 'A repeating request was detected and stopped',
                    url: baseUrl + '/mateu/v3/sync/' + (route || '_no_route'), actionId })
            }
            return {
                messages: loop.firstTrip ? [{
                    title: '',
                    text: chromeText('repeatingRequest'),
                    position: 'bottom-end',
                    variant: 'error',
                    duration: 6000,
                }] : [],
                commands: [],
                fragments: [],
                banners: [],
                appendBanners: false,
                appData: undefined,
                appState: undefined,
            }
        }
        // the app-level context (@AppContext header selectors) travels with EVERY request:
        // explicit appState entries win over the persisted context
        const uri = baseUrl + '/mateu/v3/sync/' + ((route && route != '')?route:'_no_route')
        // …but only to an origin trusted with the user's credentials (credentialScope.ts)
        appState = mayCarryCredentials(uri) ? { ...readAppContext(), ...appState } : { ...appState }
        const payload = {
            serverSideType,
            appState,
            componentState,
            parameters,
            initiatorComponentId,
            consumedRoute,
            route: (route && route != '')?'/' + route:'',
            actionId,
            // ETag of the structure the client already has for this route: lets the server omit the
            // component and reply with only state/data when it still matches (phase b).
            knownStructureHash: options.knownStructureHash
        }
        const idempotent = isIdempotentAction(actionId, options.idempotent)
        const send = () => this.post(uri, payload, options.timeoutMillis, options.isStale)
            .then((response) => {
                observeWireVersion(response.data)
                // redeployed while the page was open? (buildWatch.ts)
                observeMateuResponse(uri, response.headers)
                // an origin the app does not trust answers through the untrusted strip (R1)
                return asAnsweredBy(uri, response.data as UIIncrement)
            }, (error: unknown) => {
                markStaleScreen(uri, error)
                throw error
            })
        return await this.wrap<UIIncrement>(
            () => this.sendWithRetry(send, idempotent, options.quiet, options.isStale), initiator, background,
            actionId, options.retry, options.quiet, options.isStale)
    }

}

/**
 * A Mateu refusal (403) answered by another build than the screen's: tag the error so it is told
 * as a stale screen, not as a missing permission (requestPolicy.ts).
 */
const markStaleScreen = (uri: string, error: unknown): void => {
    const response = (error as { response?: { status?: number, data?: unknown, headers?: unknown } } | undefined)?.response
    if (response?.status !== 403 || !isMateuRefusal(response.data)) return
    if (isStaleScreenRefusal(uri, response.headers) && error && typeof error === 'object') {
        (error as Record<string, unknown>)[STALE_SCREEN] = true
    }
}

export const mateuApiClient = new AxiosMateuApiClient()

