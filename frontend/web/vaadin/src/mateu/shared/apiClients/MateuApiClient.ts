import UI from "./dtos/UI";
import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios";
import {nanoid} from "nanoid";
import UIIncrement from "./dtos/UIIncrement";
import Page from "./dtos/Page";
import Component from "./dtos/Component";

let abortControllers: AbortController[] = [];
let fetchRowsAbortController0 = new AbortController()
let fetchRowsAbortController1 = new AbortController()

export class MateuApiClient {

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

    async postMax2(uri: string, data:object): Promise<AxiosResponse> {
        fetchRowsAbortController0.abort()
        fetchRowsAbortController0 = fetchRowsAbortController1
        const abortController =  new AbortController();
        fetchRowsAbortController1 = abortController

        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.post(uri, data, {
            signal: abortController.signal
        });
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

    async fetchUi(uiId: string): Promise<UI> {
        return this.fetchRemoteUi(this.baseUrl, uiId)
    }

    async fetchRemoteUi(baseUrl: string, uiId: string): Promise<UI> {
        return await this.wrap<UI>(this.get(baseUrl + '/uis/' + uiId)
            .then((response) => response.data))
    }

    async createJourneyAndReturn(uiId: string, journeyType: string, journeyId: string): Promise<UIIncrement> {
        return await this.wrap<UIIncrement>(this.getUsingPost(this.baseUrl + '/' + uiId + '/journeys/'
            + journeyType + '/' + journeyId,
            {
                "context-data": this.contextData,
                "hash": window.location.hash
            }
        ).then((response) => response.data))
    }
    async runStepActionAndReturn(baseUrl: string, uiId: string, journeyType: string, journeyId: string, stepId: string, componentId: string, actionId: string,
                        componentType: string, data: unknown): Promise<UIIncrement> {
        return this.wrap<UIIncrement>(this.getUsingPost(baseUrl + '/' + uiId + '/journeys/' +
            journeyType + '/' + journeyId + '/steps/' + stepId
            + '/' + componentId+ '/' + actionId, {
                componentType: componentType,
                data: data,
            "context-data": this.contextData,
            "hash": window.location.hash
            }
        ).then((response) => response.data).catch((error) => {
            console.log('error en post', error)
            throw  error
        }))
    }

    async fetchRows(baseUrl: string, uiId: string, journeyType: string, journeyId: string, stepId: string, listId: string,
                    page: number, pageSize: number,
                    sortOrders: string, searchText: string | undefined, filters: object, component: Component, data: unknown
                    ): Promise<Page> {
        const payload = {
            __filters: filters,
            __data: data,
            __searchText: searchText,
            __componentType: component.className
        }
        return await this.wrap<Page>(this.postMax2(baseUrl + '/' + uiId + '/journeys/' + journeyType
            + '/' + journeyId +
            "/steps/" + stepId +
            '/' + listId +
            "/lists/unique/rows?page=" + page + "&page_size=" + pageSize +
            "&ordering=" + sortOrders
            , payload)
            .then((response) => response.data))
    }

    async getCsv(uiId: string, journeyType: string, journeyId: string, stepId: string, listId: string,
                 sortOrders: string, searchText: string | undefined, filters: string): Promise<void> {
        const data = {
            __searchText: searchText,
            __filters: filters,
            __journey: JSON.parse(sessionStorage.getItem(journeyId)!)
        }
        await this.wrap<void>(this.getUsingPost(this.baseUrl + '/' + uiId + "/journeys/" + journeyType
            + '/' + journeyId +
            "/steps/" + stepId +
            "/lists/" + listId + "/csv?" +
            "&ordering=" + sortOrders, data)
            .then((response) => {
                const type = response.headers['content-type']
                const blob = new Blob([response.data], { type: type })
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = 'file.csv'
                link.click()
                return response.data
            }))
    }

    async getXls(uiId: string, journeyType: string, journeyId: string, stepId: string, listId: string,
                 sortOrders: string, searchText: string | undefined, filters: any): Promise<void> {
        const data = {
            __searchText: searchText,
            __filters: filters,
            __journey: JSON.parse(sessionStorage.getItem(journeyId)!)
        }
        await this.wrap<number>(this.getUsingPost(this.baseUrl + '/' + uiId + "/journeys/" + journeyType
            + '/' + journeyId +
            "/steps/" + stepId +
            "/lists/" + listId + "/xls?" +
            "&ordering=" + sortOrders, data)
            .then((response) => {
                const type = response.headers['content-type']
                const blob = new Blob([response.data], { type: type })
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = 'file.xlsx'
                link.click()
                return response.data
            }))
    }

}

