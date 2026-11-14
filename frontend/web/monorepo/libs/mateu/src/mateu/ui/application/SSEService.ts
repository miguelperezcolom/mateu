import { Service } from "@application/service.ts";
import { addReferencedRestSources } from "@infra/http/restSourceCatalogue.ts";
import { AxiosMateuApiClient } from "../infra/http/AxiosMateuApiClient";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement.ts";
import type UICommand from "@mateu/shared/apiClients/dtos/UICommand.ts";
import { appData, appState, upstream } from "@domain/state.ts";
import { showServerMessage } from "@infra/notify/messageToast.ts";
import { addressed, applyGlobalCommand, taskIdsOf } from "@infra/progress/globalCommands.ts";
import { taskStore, type TaskOrigin } from "@infra/progress/taskStore.ts";
import { LitElement } from "lit";
import { ComponentState } from "@infra/ui/renderers/types.ts";
import { RunActionOptions } from "@domain/MateuApiClient";
import { isStaleResponse, StaleResponse } from "@infra/ui/staleViewGuard.ts";
import { credentialHeadersFor } from '@infra/http/credentialScope.ts'
import { rendererHeaders } from '@infra/http/rendererIdentity.ts'
import { buildOf, isStaleScreenRefusal, observeMateuResponse, STALE_SCREEN } from '@infra/http/buildWatch.ts'
import { backendKeyOf } from '@infra/http/backendKey.ts'
import { noteBackendBuild } from '@infra/routeStructureCache.ts'
import { isMateuRefusal } from '@infra/http/requestPolicy.ts'
import { asAnsweredBy } from '@infra/ui/untrustedDefinition.ts'
import { underPublicBase } from '@infra/http/publicBase.ts'
import { observeWireVersion } from '@infra/http/wireVersion.ts'
import { mayCarryCredentials } from '@infra/http/credentialScope.ts'
import { readAppContext } from '@infra/appContextStore.ts'
import { handleSessionExpired } from '@infra/http/sessionGuard.ts'
import { notify } from '@application/Notifier.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { isFinished } from '@infra/progress/taskStore.ts'

export class SSEService implements Service {

    async runAction(mateuApiClient: AxiosMateuApiClient, baseUrl: string, route: string, consumedRoute: string, actionId: string, initiatorComponentId: string, _appState: ComponentState, serverSideType: string, componentState: ComponentState, parameters: Record<string, unknown>, initiator: HTMLElement, background: boolean, callback: ((result?: unknown) => void) | undefined, callbackonly: boolean, callbackToken: string, options: RunActionOptions = {}): Promise<void> {
        // Same contract as HttpService: "Retry" re-runs the whole streamed action.
        const rerun = (changes: RunActionOptions = {}) => {
            void this.runAction(mateuApiClient, baseUrl, route, consumedRoute, actionId,
                initiatorComponentId, _appState, serverSideType, componentState, parameters,
                initiator, background, callback, callbackonly, callbackToken,
                { ...options, afterReauthentication: undefined, ...changes })
        }
        const retry = () => rerun()
        // from the task center, once the screen that started the task may be gone
        const retryFromTaskCenter = () => rerun({ fromTaskCenter: true })

        // An empty route is the root view of a mount: it streams to /mateu/v3/sse/_no_route, the
        // same placeholder the sync path uses. It used to return here, so a LongTask on the root
        // view of a mount silently did nothing.

        route = route?route:'_no_route'

        if (route && route.startsWith('/')) {
            route = route.substring(1)
        }

        // under the app's public base, like the sync path (publicBase.ts)
        const sseUrl = underPublicBase(baseUrl) + '/mateu/v3/sse/' + route
        const payload = {
            serverSideType,
            // the app-level context (@AppContext header selectors) travels with EVERY request, as on
            // the sync path — and only to an origin trusted with the user's credentials
            appState: mayCarryCredentials(sseUrl) ? { ...readAppContext(), ...appState.value } : appState.value,
            componentState,
            parameters,
            initiatorComponentId,
            consumedRoute,
            route: '/' + route,
            actionId,
            // an embedded micro frontend says so: its server sends no window commands
            ...(options.embeddedChrome ? { embeddedChrome: options.embeddedChrome } : {}),
        }

        // (a re-run after a re-authentication is the same action, already announced)
        if (!background && !options.afterReauthentication) {
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
        // …and only to an origin trusted with them (credentialScope.ts)
        Object.assign(headers, credentialHeadersFor(sseUrl))
        // only Mateu's own endpoints are told who calls (rendererIdentity.ts)
        Object.assign(headers, rendererHeaders())

        // the tasks this stream reports (a resume stream reports its task from the first byte):
        // if it ends or breaks before they do, they are recovered or end failed
        const streamTasks = new Set<string>(options.resumesTasks)
        // the server itself said it failed (an error line): nothing to resume
        let serverFailed = false
        fetch(sseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        }).then(async response => {
            // Every chunk is checked: a stream still running when the user navigated away
            // stops being applied there (staleViewGuard.ts). Its FIRST event decides what it is,
            // so nothing is cancelled before: closing a stream that has not reported its task yet
            // would dispose the work on the server, with no message and no entry in the task center.
            let reader: ReadableStreamDefaultReader<string> | undefined
            // A stream that reports a TASK (Progress commands) outlives its screen: the task center
            // keeps showing it wherever the user goes, so it is read to the end — closing it would
            // cancel the task on the server. Once its screen is gone only its page-level parts
            // (progress, inbox changes, messages) still apply.
            let reportsTask = false
            let screenGone = false
            const dropIfStale = (outcome: 'answered' | 'failed') => {
                if (options.isStale?.()) {
                    if (reportsTask) {
                        screenGone = true
                        return
                    }
                    void reader?.cancel().catch(() => undefined)
                    throw new StaleResponse(actionId, outcome)
                }
            }
            // fetch does not reject on an HTTP error: a 401/403/500 whose body carries no stream
            // used to read as an empty stream and report SUCCESS — the action silently did nothing.
            if (response.ok === false) {
                let message = `HTTP ${response.status}`
                let body: unknown
                try {
                    const text = await response.text()
                    body = text
                    try { body = JSON.parse(text); message = (body as { message?: string })?.message || message } catch { if (text.trim()) message = text.trim() }
                } catch { /* no body */ }
                // Mateu's refusal from another deployment than the screen's: a stale screen, told
                // as such with a Reload (buildWatch.ts, requestPolicy.ts)
                if (response.status === 403 && isMateuRefusal(body)
                    && isStaleScreenRefusal(sseUrl, response.headers)) {
                    throw Object.assign(new Error(message), {
                        [STALE_SCREEN]: true, response: { status: 403, data: body },
                    })
                }
                // Same contract as a sync call (sessionGuard.ts): the token expired, the app gets a
                // chance to re-authenticate and the action runs again, once. A view no longer on
                // screen does not ask the user to log in.
                if (response.status === 401 && !options.afterReauthentication && !options.isStale?.()) {
                    await handleSessionExpired(new Error(message), async () => rerun({ afterReauthentication: true }))
                    return
                }
                throw new Error(message)
            }
            observeMateuResponse(sseUrl, response.headers)
            noteBackendBuild(backendKeyOf(sseUrl), buildOf(response.headers))
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
                            const parsed = JSON.parse(line.substring('data:'.length).trim())
                            observeWireVersion(parsed)
                            // an origin the app does not trust answers through the untrusted strip (R1)
                            const uiIncrement = asAnsweredBy(baseUrl + '/mateu/v3/sse/' + route, parsed)

                            taskIdsOf(uiIncrement).forEach(id => streamTasks.add(id))
                            if (!reportsTask && streamTasks.size > 0) {
                                reportsTask = true
                                // the task center shows the task from now on (a blocking one as its
                                // own modal): the page's loading veil and the pressed control are
                                // released, so the user can go on — or start another task
                                if (!background) {
                                    initiator.dispatchEvent(new CustomEvent('backend-succeeded-event', {
                                        bubbles: true, composed: true, detail: { actionId },
                                    }))
                                }
                            }
                            // (after reading its tasks: one that reports a task outlives its screen)
                            dropIfStale('answered')

                            if (callback && !screenGone) {
                                callback(uiIncrement)
                            }

                            const origin = { baseUrl, route: '/' + route, serverSideType, actionId, retry: retryFromTaskCenter, initiator }
                            if (!callbackonly) {
                                this.handleUIIncrement(uiIncrement, initiator, callbackToken, origin, screenGone)
                            } else if (reportsTask) {
                                // the caller handles the answer; the task center still sees its task
                                (uiIncrement as UIIncrement | undefined)?.commands?.forEach((command: UICommand) => applyGlobalCommand(command, origin))
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
                            serverFailed = true
                            throw new Error(message)
                        }
                    }
                }
            }
            // ended with no event at all, and its screen is gone: not news
            dropIfStale('answered')
            this.endUnfinished(streamTasks, baseUrl, serverSideType, options)
            // (a task stream told it already, when its task first reported)
            if (!background && !reportsTask) {
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
            if (streamTasks.size > 0) {
                // the connection broke under a running task: the server may still be running it
                if (serverFailed) taskStore.failUnfinished(streamTasks, (reason as Error)?.message)
                else this.endUnfinished(streamTasks, baseUrl, serverSideType, options, (reason as Error)?.message)
            }
            if (isStaleResponse(reason) || options.isStale?.()) {
                // Retry pressed in the task center after leaving the screen: no screen will tell
                if (options.fromTaskCenter && !isStaleResponse(reason) && streamTasks.size === 0) {
                    notify({ text: chromeText('taskRetryFailed'), variant: 'error' }, document.body)
                }
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

    /**
     * The stream ended (or broke) before these tasks did. The server keeps a task alive for a grace
     * period and offers to resume it, so an ordinary stream tries that before calling the task
     * failed; a resume stream is the last try, and what it leaves running ends failed.
     */
    private endUnfinished(taskIds: Set<string>, baseUrl: string, serverSideType: string,
                          options: RunActionOptions, error?: string) {
        const unfinished = [...taskIds].filter((id) => {
            const entry = taskStore.find(id)
            return !!entry && !isFinished(entry.progress)
        })
        if (unfinished.length === 0) return
        if (options.resumesTasks) taskStore.failUnfinished(unfinished, error)
        // (loaded on demand, like the boot's reattach: most pages never need it)
        else void import('@infra/progress/reattach.ts').then((m) => m.recoverBrokenTasks(baseUrl, serverSideType, unfinished, error))
    }

    private serialize(reason: unknown) {
        if ((reason as Error)?.message) {
            return reason
        }
        return JSON.stringify(reason)
    }

    handleUIIncrement = (uiIncrement: UIIncrement | undefined, initiator: HTMLElement, callbackToken: string,
                         origin?: TaskOrigin, pageLevelOnly = false) => {
        // first: the components about to render may fetch from the sources they name right away
        addReferencedRestSources(uiIncrement?.restSources)
        uiIncrement?.messages?.forEach(message => {
            // The Notifier port renders the toast (actions, persistence, key) design-system-neutrally.
            showServerMessage(message, initiator)
        })
        // a task's progress and an inbox change belong to the page (the task center, the bell):
        // they apply wherever the user is now
        const commands = (uiIncrement?.commands ?? []).filter(command => !applyGlobalCommand(command, { ...origin, initiator }))
        if (pageLevelOnly) {
            // a task stream whose screen is gone: only its page-level parts still apply (above)
            return
        }
        if (uiIncrement?.banners && uiIncrement.banners.length > 0) {
            document.dispatchEvent(new CustomEvent('page-banners-received', {
                detail: { banners: uiIncrement.banners, append: uiIncrement.appendBanners ?? false },
                bubbles: false,
                composed: false
            }))
        }

        commands.forEach(command => {
            upstream.next({
                command: addressed(command, initiator),
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