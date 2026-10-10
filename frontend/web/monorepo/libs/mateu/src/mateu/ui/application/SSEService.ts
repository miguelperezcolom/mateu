import { Service } from "@application/service.ts";
import { AxiosMateuApiClient } from "../infra/http/AxiosMateuApiClient";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement.ts";
import { appData, appState, upstream } from "@domain/state.ts";
import { notify } from "@application/Notifier.ts";
import { LitElement } from "lit";
import { ComponentState } from "@infra/ui/renderers/types.ts";
import { RunActionOptions } from "@domain/MateuApiClient";
import { isStaleResponse, StaleResponse } from "@infra/ui/staleViewGuard.ts";
import { authHeaders, sessionId } from '@infra/http/authToken.ts'

export class SSEService implements Service {

    async runAction(mateuApiClient: AxiosMateuApiClient, baseUrl: string, route: string, consumedRoute: string, actionId: string, initiatorComponentId: string, _appState: ComponentState, serverSideType: string, componentState: ComponentState, parameters: Record<string, unknown>, initiator: HTMLElement, background: boolean, callback: ((result?: unknown) => void) | undefined, callbackonly: boolean, callbackToken: string, options: RunActionOptions = {}): Promise<void> {
        // Same contract as HttpService: "Retry" re-runs the whole streamed action.
        const retry = () => {
            void this.runAction(mateuApiClient, baseUrl, route, consumedRoute, actionId,
                initiatorComponentId, _appState, serverSideType, componentState, parameters,
                initiator, background, callback, callbackonly, callbackToken, options)
        }

        // An empty route is the root view of a mount: it streams to /mateu/v3/sse/_no_route, the
        // same placeholder the sync path uses. It used to return here, so a LongTask on the root
        // view of a mount silently did nothing.

        route = route?route:'_no_route'

        if (route && route.startsWith('/')) {
            route = route.substring(1)
        }

        const payload = {
            serverSideType,
            appState: appState.value,
            componentState,
            parameters,
            initiatorComponentId,
            consumedRoute,
            route: '/' + route,
            actionId
        }

        if (!background) {
            initiator.dispatchEvent(new CustomEvent('backend-called-event', {
                bubbles: true,
                composed: true,
                detail: {
                }
            }))
        }
        // Same identity as every other call the client makes. This is a bare fetch rather
        // than the axios instance, so it does not go through the interceptor that puts the
        // token and the session id on an ordinary request — they have to be set here, the
        // way mateu-chat's own SSE stream already does it. Without them an SSE action is
        // the one anonymous request in the client, which a shell behind a gateway that
        // checks the token rejects while everything else works.
        const headers: Record<string, string> = {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json'
        }
        Object.assign(headers, authHeaders())
        const sid = sessionId(false)
        if (sid) headers['X-Session-Id'] = sid

        fetch(baseUrl + '/mateu/v3/sse/' +
            route, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        }).then(async response => {
            // Every chunk is checked: a stream still running when the user navigated away
            // stops being applied there (staleViewGuard.ts).
            let reader: ReadableStreamDefaultReader<string> | undefined
            const dropIfStale = (outcome: 'answered' | 'failed') => {
                if (options.isStale?.()) {
                    void reader?.cancel().catch(() => undefined)
                    throw new StaleResponse(actionId, outcome)
                }
            }
            dropIfStale('answered')
            reader = response.body?.pipeThrough(new TextDecoderStream()).getReader()
            if (reader) {
                let buffer = ''
                while (true) {
                    const {value, done} = await reader.read();
                    if (done) break;
                    buffer += value
                    const events = buffer.split('\n\n')
                    buffer = events.pop() ?? ''
                    for (const event of events) {
                        const line = event.trim()
                        if (!line) continue
                        if (line.startsWith('data:')) {
                            dropIfStale('answered')
                            const uiIncrement = JSON.parse(line.substring('data:'.length).trim())

                            if (callback) {
                                callback(uiIncrement)
                            }

                            if (!callbackonly) {
                                this.handleUIIncrement(uiIncrement, initiator, callbackToken)
                            }

                            if (uiIncrement.messages && uiIncrement.messages.length == 1) {
                                if (uiIncrement.messages[0].variant == 'error') {
                                    initiator.shadowRoot?.dispatchEvent(new CustomEvent('backend-call-failed', {
                                        detail: {
                                            actionId
                                        },
                                        bubbles: true,
                                        composed: true
                                    }))
                                }
                            }
                        } else {
                            let message = line;
                            try {
                                const error = JSON.parse(line);
                                message = error.message;
                                if (error._embedded?.errors?.length > 0) {
                                    if (error._embedded.errors[0].message) {
                                        message = error._embedded.errors[0].message
                                    }
                                }
                            } catch (ignored) {

                            }
                            dropIfStale('failed')
                            throw new Error(message)
                        }
                    }
                }
            }
            if (!background) {
                initiator.dispatchEvent(new CustomEvent('backend-succeeded-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        actionId
                    }
                }))
            }
            initiator.shadowRoot?.dispatchEvent(new CustomEvent('backend-call-succeeded', {
                detail: {
                    actionId
                },
                bubbles: true,
                composed: true
            }))
        })
            .catch(reason => {
            if (isStaleResponse(reason) || options.isStale?.()) {
                console.debug?.('mateu: dropped a streamed answer to an action of a view no longer on screen',
                    actionId, serverSideType, baseUrl)
                initiator.dispatchEvent(new CustomEvent('backend-cancelled-event', {
                    bubbles: true, composed: true, detail: { actionId },
                }))
                return
            }
            initiator.dispatchEvent(new CustomEvent('backend-failed-event', {
                bubbles: true,
                composed: true,
                detail: {
                    actionId,
                    reason: this.serialize(reason),
                    retry
                }
            }))
                initiator.shadowRoot?.dispatchEvent(new CustomEvent('backend-call-failed', {
                    detail: {
                        actionId
                    },
                    bubbles: true,
                    composed: true
                }))
        })



    }

    private serialize(reason: unknown) {
        if ((reason as Error)?.message) {
            return reason
        }
        return JSON.stringify(reason)
    }

    handleUIIncrement = (uiIncrement: UIIncrement | undefined, initiator: HTMLElement, callbackToken: string) => {
        uiIncrement?.messages?.forEach(message => {
            // The Notifier port renders the toast (incl. the undoable variant) design-system-neutrally.
            notify({
                text: message.text,
                position: message.position,
                variant: message.variant,
                duration: message.duration,
                undoLabel: message.undoLabel,
                undoActionId: message.undoActionId,
                undoParameters: message.undoParameters,
            }, initiator)
        })
        if (uiIncrement?.banners && uiIncrement.banners.length > 0) {
            document.dispatchEvent(new CustomEvent('page-banners-received', {
                detail: { banners: uiIncrement.banners, append: uiIncrement.appendBanners ?? false },
                bubbles: false,
                composed: false
            }))
        }

        uiIncrement?.commands?.forEach(command => {
            upstream.next({
                command,
                fragment: undefined,
                ui: undefined,
                error: undefined,
                callbackToken,
                initiator
            })
        })
        uiIncrement?.fragments?.forEach(fragment => {
            upstream.next({
                command: undefined,
                fragment,
                ui: undefined,
                error: undefined,
                callbackToken,
                initiator
            })
        })
        if (uiIncrement?.appState) {
            appState.value = {...uiIncrement.appState}
            const litElement = initiator as LitElement
            litElement.dispatchEvent(new CustomEvent('app-data-updated', {
                bubbles: true,
                composed: true
            }))
        }
        if (uiIncrement?.appData) {
            const newAppData = uiIncrement?.appData
            appData.value = {...uiIncrement.appData, ...newAppData}
            const litElement = initiator as LitElement
            litElement.dispatchEvent(new CustomEvent('app-data-updated', {
                bubbles: true,
                composed: true
            }))
        }
    }

}

export const sseService = new SSEService()