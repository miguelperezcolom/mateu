import { loadUiCommandHandler } from "@domain/commands/loadUi/LoadUiCommandHandler";
import { AxiosMateuApiClient } from "@infra/http/AxiosMateuApiClient";
import { appState, upstream } from "@domain/state";
import { runActionCommandHandler } from "@domain/commands/runAction/RunActionCommandHandler";
import { RunActionCommand } from "@domain/commands/runAction/RunActionCommand";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import { Service } from "@application/service.ts";
import { Notification, NotificationPosition } from '@vaadin/notification';

export class HttpService implements Service {

    async loadUi(mateuApiClient: AxiosMateuApiClient, baseUrl: string,
                 path: string | undefined,
                 config: any, initiator: HTMLElement) {
        const changes = await loadUiCommandHandler.handle(mateuApiClient, {
            baseUrl: baseUrl,
            initiator: initiator,
            config,
            path: path
        })
        upstream.next({
            command: undefined,
            fragment: undefined,
            ui: changes.ui,
            error: undefined
        })
        this.handleUIIncrement(changes.ui.home)
    }

    mapPosition = (position: string): NotificationPosition => {
        switch(position) {
            case 'topStretch': return 'top-stretch'
            case 'topStart': return 'top-start'
            case 'topCenter': return 'top-center'
            case 'topEnd': return 'top-end'
            case 'middle': return 'middle'
            case 'bottomStart': return 'bottom-start'
            case 'bottomEnd': return 'bottom-end'
            case 'bottomStretch': return 'bottom-stretch'
            case 'bottomCenter': return 'bottom-center'
        }
        return 'bottom-end'
    }

    handleUIIncrement = (uiIncrement: UIIncrement | undefined) => {
        uiIncrement?.messages?.forEach(message => {
            Notification.show(message.text, {
                position: message.position?this.mapPosition(message.position):undefined,
                theme: message.variant,
                duration: message.duration
            });
        })
        uiIncrement?.commands?.forEach(command => {
            upstream.next({
                command,
                fragment: undefined,
                ui: undefined,
                error: undefined
            })
        })
        uiIncrement?.fragments?.forEach(fragment => {
            upstream.next({
                command: undefined,
                fragment,
                ui: undefined,
                error: undefined
            })
        })
        if (uiIncrement?.appState) {
            appState.value = uiIncrement.appState
        }
    }

    async runAction(mateuApiClient: AxiosMateuApiClient,
                    baseUrl: string,
                    route: string,
                    consumedRoute: string,
                    actionId: string,
                    initiatorComponentId: string,
                    appState: any,
                    serverSideType: string,
                    componentState: any,
                    parameters: any,
                    initiator: HTMLElement,
                    background: boolean,
    callback: any) {
        if (false && !route) {
            return
        }
        const changes = await runActionCommandHandler.handle(mateuApiClient, {
            baseUrl,
            route,
            consumedRoute,
            actionId,
            appState,
            initiatorComponentId,
            componentState,
            parameters,
            serverSideType,
            initiator,
            background
        } as RunActionCommand)
        this.handleUIIncrement(changes.uiIncrement)
        if (callback) {
            callback()
        }
    }

}

export const httpService = new HttpService()