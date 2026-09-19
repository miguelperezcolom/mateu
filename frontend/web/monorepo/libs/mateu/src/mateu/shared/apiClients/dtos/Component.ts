import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";

export default interface Component {

    type: ComponentType
    id: string | undefined
    children: Component[] | undefined
    style: string
    cssClasses: string
    slot: string
    initialData: unknown
    confirmOnNavigationIfDirty: boolean
    /** The sizing intent (coherence-plan #8): "hug" | "fill" | "fixed:<len>". Absent = default flow.
     *  Applied to the component's host element by applySizing. */
    sizing?: string | undefined

}
