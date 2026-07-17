import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios"
import { readAppContext } from '@infra/appContextStore.ts';
import { handleSessionExpired } from '@infra/http/sessionGuard.ts';
import { loginRedirectTarget } from '@infra/http/redirectGuard.ts';
import {nanoid} from "nanoid"
import {MateuApiClient} from "@domain/MateuApiClient";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import {ComponentState} from "@infra/ui/renderers/types.ts";

let abortControllers: AbortController[] = []

export class AxiosMateuApiClient implements MateuApiClient {

    axiosInstance = axios.create({timeout: 60000})

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

    async wrap<T>(call: Promise<T>, initiator: HTMLElement, background: boolean, actionId: string): Promise<T> {
        if (!background) {
            initiator.dispatchEvent(new CustomEvent('backend-called-event', {
                bubbles: true,
                composed: true,
                detail: {
                }
            }))
        }
        return call.then(response => {
            initiator.dispatchEvent(new CustomEvent('backend-succeeded-event', {
                bubbles: true,
                composed: true,
                detail: {
                    actionId
                }
            }))
            return response
        }).catch((reason: unknown) => {
            if ((reason as { code?: string })?.code == 'ERR_CANCELED') {
                initiator.dispatchEvent(new CustomEvent('backend-cancelled-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                    }
                }))
            } else {
                initiator.dispatchEvent(new CustomEvent('backend-failed-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        actionId,
                        reason: this.serialize(reason)
                    }
                }))
            }
            throw reason
        })
    }

    private serialize(reason: unknown) {
        if ((reason as Error)?.message) {
            return reason
        }
        return JSON.stringify(reason)
    }

    async get(uri: string): Promise<AxiosResponse> {
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.get(uri, {
            signal: abortController.signal
        });
    }

    async post(uri: string, data: unknown): Promise<AxiosResponse<any>> {
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]
        return this.axiosInstance.post(uri, data,{
            signal: abortController.signal
        });
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
                    background: boolean): Promise<UIIncrement> {
        if (route && route.startsWith('/')) {
            route = route.substring(1)
        }
        // the app-level context (@AppContext header selectors) travels with EVERY request:
        // explicit appState entries win over the persisted context
        appState = { ...readAppContext(), ...appState }
        return await this.wrap<UIIncrement>(this.post(baseUrl + '/mateu/v3/sync/' +
            ((route && route != '')?route:'_no_route'), {
            serverSideType,
            appState,
            componentState,
            parameters,
            initiatorComponentId,
            consumedRoute,
            route: (route && route != '')?'/' + route:'',
            actionId
        })
            .then((response) => response.data), initiator, background, actionId)
    }

}

export const mateuApiClient = new AxiosMateuApiClient()

