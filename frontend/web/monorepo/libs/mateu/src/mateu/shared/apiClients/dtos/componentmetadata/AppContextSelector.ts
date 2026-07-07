// An application-level context selector: a widget on the app header that fixes a value for every
// screen of the app (the active hotel, the company…). The picked option's value is persisted
// client-side and merged into the appState of every request under fieldName.
export default interface AppContextSelector {
    fieldName: string
    label: string
    options: { value: unknown, label: string }[]
}
