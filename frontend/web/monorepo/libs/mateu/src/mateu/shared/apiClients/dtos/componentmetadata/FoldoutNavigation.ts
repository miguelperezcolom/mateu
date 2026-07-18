// Navigation Header of a foldout: prev/next between objects of the same type + go-to-parent.
// A null/blank actionId hides the corresponding control.
export default interface FoldoutNavigation {

    title?: string

    parentLabel?: string

    parentActionId?: string

    previousActionId?: string

    nextActionId?: string

}
