/// <reference path="../types/mateu.d.ts" />

export * from './mateu/ui/infra/ui/mateu-ui'
export type {ComponentRenderer} from './mateu/ui/infra/ui/renderers/ComponentRenderer'
export { componentRenderer } from './mateu/ui/infra/ui/renderers/ComponentRenderer'
export { BasicComponentRenderer } from './mateu/ui/infra/ui/renderers/BasicComponentRenderer'
export type ClientSideComponent = './mateu/shared/apiClients/dtos/ClientSideComponent'