import { LitElement, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Component from "@mateu/shared/apiClients/dtos/Component";

export type ComponentState = Record<string, any>
export type ComponentData = Record<string, any>

export type ComponentRenderFn = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData
) => TemplateResult

export type LayoutRenderFn = (
    container: LitElement,
    component: Component,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData
) => TemplateResult
