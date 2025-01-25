import UI from "../../../shared/apiClients/dtos/UI"
import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios"
import {nanoid} from "nanoid"
import {MateuApiClient} from "../../domain/MateuApiClient";

let abortControllers: AbortController[] = []

export class AxiosMateuApiClient implements MateuApiClient {

    axiosInstance = axios.create({timeout: 60000})

    baseUrl: string = ''
    element: HTMLElement = document.body;
    contextData: unknown = {}

    constructor(journeyStarter: HTMLElement) {
        this.element = journeyStarter
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

    async wrap<T>(call: Promise<T>): Promise<T> {
        this.element.dispatchEvent(new CustomEvent('backend-called-event', {
            bubbles: true,
            composed: true,
            detail: {
            }
        }))
        return call.then(response => {
            this.element.dispatchEvent(new CustomEvent('backend-succeeded-event', {
                bubbles: true,
                composed: true,
                detail: {
                }
            }))
            return response
        }).catch((reason) => {
            if (reason.code == 'ERR_CANCELED') {
                this.element.dispatchEvent(new CustomEvent('backend-cancelled-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                    }
                }))
            } else {
                this.element.dispatchEvent(new CustomEvent('backend-failed-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        reason: this.serialize(reason)
                    }
                }))
            }
            throw reason
        })
    }

    private serialize(reason: any) {
        if (reason.message) {
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

    async getUsingPost(uri: string, data: unknown): Promise<AxiosResponse<any>> {
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

    async fetchUi(baseUrl: string): Promise<UI> {
        return await this.wrap<UI>(this.getUsingPost(baseUrl + '/mateu/v3/ui', {
            "context-data": this.contextData,
            "hash": window.location.hash
        })
            .then((response) => response.data))
    }

}

