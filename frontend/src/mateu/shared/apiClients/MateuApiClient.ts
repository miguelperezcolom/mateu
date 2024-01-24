import UI from "./dtos/UI";
import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios";
import JourneyType from "./dtos/JourneyType";
import Journey from "./dtos/Journey";
import Step from "./dtos/Step";
import {nanoid} from "nanoid";
import StepWrapper from "./dtos/StepWrapper";

let abortControllers: AbortController[] = [];
let fetchRowsAbortController0 = new AbortController()
let fetchRowsAbortController1 = new AbortController()

export default class MateuApiClient {

    axiosInstance = axios.create({timeout: 60000})

    baseUrl: string = ''
    element: HTMLElement = document.body;

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
            //console.log('adding token' + token)
            config.headers.Authorization =  'Bearer ' + token;
        } else {
            //console.log('no token added')
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
                console.log('error on api call', reason)
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

    async getMax2(uri: string): Promise<AxiosResponse> {
        fetchRowsAbortController0.abort()
        fetchRowsAbortController0 = fetchRowsAbortController1
        const abortController =  new AbortController();
        fetchRowsAbortController1 = abortController

        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.get(uri, {
            signal: abortController.signal
        });
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
        //console.log('get', uri)
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.get(uri, {
            signal: abortController.signal
        });
    }

    async getBlob(uri: string): Promise<AxiosResponse> {
        //console.log('get', uri)
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.get(uri, {
            signal: abortController.signal
            , responseType: 'blob'
        });
    }

    async post(uri: string, data: unknown): Promise<void> {
        //console.log('post', uri, data)
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.post(uri, data,{
            signal: abortController.signal
        });
    }

    async getUsingPost(uri: string, data: unknown): Promise<AxiosResponse> {
        //console.log('post', uri, data)
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.post(uri, data,{
            signal: abortController.signal
        });
    }

    async abortAll() {
        console.log('aborting api calls', abortControllers)
        abortControllers.forEach(c => c.abort());
        abortControllers = []
        console.log('api calls cancelled')
    }

    async fetchUi(uiId: string): Promise<UI> {
        return await this.wrap<UI>(this.get(this.baseUrl + '/uis/' + uiId)
            .then((response) => response.data))
    }

    async fetchJourneyTypes(): Promise<JourneyType[]> {
        return await this.wrap<JourneyType[]>(this.get(this.baseUrl + '/journey-types')
            .then((response) => response.data))
    }

    async createJourney(journeyType: string, journeyId: string): Promise<void> {
        return await this.wrap<void>(this.post(this.baseUrl + '/journeys/'
            + journeyType + '/' + journeyId,
            {
                    "context-data": {}
                }
            ))
    }

    async fetchJourney(journeyType: string, journeyId: string): Promise<Journey> {
        return await this.wrap<Journey>(this.get(this.baseUrl + '/journeys/'
            + journeyType + '/' + journeyId)
                .then((response) => response.data))
    }

    async fetchStep(journeyType: string, journeyId: string, stepId: string): Promise<Step> {
        return await this.wrap<Step>(this.get(this.baseUrl + '/journeys/' +
            journeyType + '/' + journeyId + '/steps/' + stepId)
                .then((response) => {
                    const newStep = response.data
                    newStep.timestamp = nanoid()
                    return newStep
                }))
    }

    async runStepAction(journeyType: string, journeyId: string, stepId: string, actionId: string,
                        data: unknown): Promise<void> {
        return await this.wrap<void>(this.post(this.baseUrl + '/journeys/' +
            journeyType + '/' + journeyId + '/steps/' + stepId
                + '/' + actionId, {
                    data: data,
                    journey: JSON.parse(sessionStorage.getItem(journeyId)!)
                }
            ).catch((error) => {
                console.log('error en post', error)
            throw  error
        }))
    }

    async createJourneyAndReturn(journeyType: string, journeyId: string): Promise<StepWrapper> {
        return await this.wrap<StepWrapper>(this.getUsingPost(this.baseUrl.replace('v1', 'v2') + '/journeys/'
            + journeyType + '/' + journeyId,
            {
                "context-data": {}
            }
        ).then((response) => response.data))
    }
    async runStepActionAndReturn(journeyType: string, journeyId: string, stepId: string, actionId: string,
                        data: unknown): Promise<StepWrapper> {
        return await this.wrap<StepWrapper>(this.getUsingPost(this.baseUrl.replace('v1', 'v2') + '/journeys/' +
            journeyType + '/' + journeyId + '/steps/' + stepId
            + '/' + actionId, {
                data: data,
                journey: JSON.parse(sessionStorage.getItem(journeyId)!)
            }
        ).then((response) => response.data).catch((error) => {
            console.log('error en post', error)
            throw  error
        }))
    }

    async fetchRows(journeyType: string, journeyId: string, stepId: string, listId: string,
                    page: number, pageSize: number,
                    sortOrders: string, filters: object
                    ): Promise<any[]> {
        const data = {
            __filters: filters,
            __journey: JSON.parse(sessionStorage.getItem(journeyId)!)
        }
        return await this.wrap<any[]>(this.postMax2(this.baseUrl + "/journeys/" + journeyType
            + '/' + journeyId +
            "/steps/" + stepId +
            "/lists/" + listId + "/rows?page=" + page + "&page_size=" + pageSize +
            "&ordering=" + sortOrders, data)
            .then((response) => response.data))
    }

    async fetchCount(journeyType: string, journeyId: string, stepId: string, listId: string,
                     filters: object
    ): Promise<number> {
        const data = {
            __filters: filters,
            __journey: JSON.parse(sessionStorage.getItem(journeyId)!)
        }
        return await this.wrap<number>(this.getUsingPost(this.baseUrl + "/journeys/" + journeyType
            + '/' + journeyId
            + "/steps/" + stepId +
            "/lists/" + listId + "/count", data)
            .then((response) => response.data))
    }

    async getCsv(journeyType: string, journeyId: string, stepId: string, listId: string,
                 sortOrders: string, filters: string): Promise<void> {
        const data = {
            __filters: filters,
            __journey: JSON.parse(sessionStorage.getItem(journeyId)!)
        }
        await this.wrap<void>(this.getUsingPost(this.baseUrl + "/journeys/" + journeyType
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

    async getXls(journeyType: string, journeyId: string, stepId: string, listId: string,
                 sortOrders: string, filters: any): Promise<void> {
        const data = {
            __filters: filters,
            __journey: JSON.parse(sessionStorage.getItem(journeyId)!)
        }
        await this.wrap<number>(this.getUsingPost(this.baseUrl + "/journeys/" + journeyType
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

    async getCsvMemory(journeyType: string, journeyId: string, stepId: string, listId: string,
                 sortOrders: string, filters: any): Promise<void> {
        window.open()
        return await this.wrap<void>(this.getBlob(this.baseUrl + "/journeys/" + journeyType
            + '/' + journeyId +
            "/steps/" + stepId +
            "/lists/" + listId + "/csv?" +
            "&ordering=" + sortOrders + "&filters=" + filters)
            .then((response) => {
                // create file link in browser's memory
                const href = URL.createObjectURL(response.data);

                // create "a" HTML element with href to file & click
                const link = document.createElement('a');
                link.href = href;
                link.setAttribute('download', 'file.csv'); //or any other extension
                document.body.appendChild(link);
                link.click();

                // clean up "a" element & remove ObjectURL
                document.body.removeChild(link);
                URL.revokeObjectURL(href);
            }))
    }

}

export const mateuApiClient = new MateuApiClient()
