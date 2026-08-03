import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios"
import { readAppContext } from '@infra/appContextStore.ts';
import { handleSessionExpired } from '@infra/http/sessionGuard.ts';
import { loginRedirectTarget } from '@infra/http/redirectGuard.ts';
import {nanoid} from "nanoid"
import {MateuApiClient, RunActionOptions} from "@domain/MateuApiClient";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import {ComponentState} from "@infra/ui/renderers/types.ts";
import {loopGuard} from "@infra/ui/loopGuard.ts";
import {classifyRequestFailure} from "@infra/http/requestPolicy.ts";
import {isIdempotentAction, retryDelayMs, shouldRetry} from "@infra/http/retryPolicy.ts";
import {connectivity} from "@infra/http/connectivity.ts";

let abortControllers: AbortController[] = []

/** Default ceiling for a sync call. Overridable per action via `@Action(timeoutMillis = …)`. */
const DEFAULT_TIMEOUT_MS = 60000

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export class AxiosMateuApiClient implements MateuApiClient {

    axiosInstance = axios.create({timeout: DEFAULT_TIMEOUT_MS})

    constructor() {
        this.axiosInstance.interceptors.request.use(config => {
            this.addAuthToken(config)
            this.addSessionId(config)
            return config;
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
            const target = loginRedirectTarget({
                requestedUrl: this.axiosInstance.getUri(response.config),
                finalUrl: (response.request as { responseURL?: string } | undefined)?.responseURL,
                contentType: String(response.headers?.['content-type'] ?? ''),
                data: response.data,
            })
            if (target) {
                window.location.assign(target)
                // the page is navigating away — settle like a cancelled request so no
                // failure toast flashes while the browser unloads
                throw Object.assign(new Error('session lost — redirecting to ' + target), { code: 'ERR_CANCELED' })
            }
            return response
        }, (error: unknown) => {
            const axiosError = error as { response?: { status?: number }, config?: InternalAxiosRequestConfig & { __mateuRetried?: boolean } }
            if (axiosError?.response?.status === 401 && axiosError.config && !axiosError.config.__mateuRetried) {
                const config = axiosError.config
                config.__mateuRetried = true
                return handleSessionExpired(error, () => this.axiosInstance.request(config))
            }
            throw error
        })
    }

    private addSessionId(config: InternalAxiosRequestConfig) {
        let sessionId = sessionStorage.getItem('__mateu_sesion_id');
        if (!sessionId) {
            sessionId = nanoid()
            sessionStorage.setItem('__mateu_sesion_id', sessionId)
        }
        config.headers['X-Session-Id'] =  sessionId;
    }

    private addAuthToken(config: InternalAxiosRequestConfig) {
        const token = localStorage.getItem('__mateu_auth_token');
        if (token) {
            config.headers.Authorization =  'Bearer ' + token;
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
                  actionId: string, retry?: () => void): Promise<T> {
        if (!background) {
            initiator.dispatchEvent(new CustomEvent('backend-called-event', {
                bubbles: true,
                composed: true,
                detail: {
                }
            }))
        }
        return call().then(response => {
            initiator.dispatchEvent(new CustomEvent('backend-succeeded-event', {
                bubbles: true,
                composed: true,
                detail: {
                    actionId
                }
            }))
            return response
        }).catch((reason: unknown) => {
            const failure = classifyRequestFailure(reason, {online: connectivity.isOnline()})
            if (failure.kind == 'cancelled') {
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
    private async sendWithRetry<T>(send: () => Promise<T>, idempotent: boolean): Promise<T> {
        let attempt = 0
        for (;;) {
            try {
                const response = await send()
                connectivity.noteReachable()
                return response
            } catch (error) {
                const failure = classifyRequestFailure(error, {online: connectivity.isOnline()})
                if (failure.kind == 'offline') {
                    connectivity.noteUnreachable()
                }
                attempt++
                if (!shouldRetry(failure, attempt, {idempotent})) {
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

    async post(uri: string, data: unknown, timeoutMillis?: number): Promise<AxiosResponse<any>> {
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]
        return this.axiosInstance.post(uri, data,{
            signal: abortController.signal,
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
            }
            return {
                messages: loop.firstTrip ? [{
                    title: '',
                    text: 'A repeating request was detected and stopped to protect the server. '
                        + 'Reload the page or navigate elsewhere.',
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
        appState = { ...readAppContext(), ...appState }
        const uri = baseUrl + '/mateu/v3/sync/' + ((route && route != '')?route:'_no_route')
        const payload = {
            serverSideType,
            appState,
            componentState,
            parameters,
            initiatorComponentId,
            consumedRoute,
            route: (route && route != '')?'/' + route:'',
            actionId
        }
        const idempotent = isIdempotentAction(actionId, options.idempotent)
        const send = () => this.post(uri, payload, options.timeoutMillis)
            .then((response) => response.data as UIIncrement)
        return await this.wrap<UIIncrement>(
            () => this.sendWithRetry(send, idempotent), initiator, background, actionId, options.retry)
    }

}

export const mateuApiClient = new AxiosMateuApiClient()

