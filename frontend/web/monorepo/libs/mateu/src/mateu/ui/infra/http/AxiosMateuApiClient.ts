import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios"
import { readAppContext } from '@infra/appContextStore.ts';
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

