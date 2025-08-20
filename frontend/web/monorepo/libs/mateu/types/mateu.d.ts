declare module 'mateu' {
    export const componentRenderer: any;
    export type ComponentRenderer = {};
    export type ClientSideComponent = {};
    export class BasicComponentRenderer {
        renderClientSideComponent(component: any, baseUrl: any, state: any, data: any);
    };
}