import Component from "./Component";

export default interface UI {

    title: string | undefined
    favIcon: string | undefined
    contextData: string | undefined

    root: Component | undefined

}
