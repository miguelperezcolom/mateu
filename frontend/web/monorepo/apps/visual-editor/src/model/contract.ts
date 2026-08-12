import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { InferredField } from './layoutDelta'

/**
 * Asks the server what inference produces for a ModelView, via the reserved `__contract__` action.
 *
 * This is what lets the editor save a **delta** rather than a snapshot: a delta is a diff, and a
 * diff needs something to diff against. Without the contract the editor cannot know whether the
 * arrangement on screen differs from the inferred one, and the only honest thing it could write is
 * the whole tree — which is exactly what takes the screen out of inference.
 *
 * The contract is derived from the same mapped output the renderer draws, so it cannot drift from
 * what the page really binds.
 *
 * Returns null when there is no model view, no backend, or the class cannot be resolved. The editor
 * keeps working in every one of those cases; it simply writes a snapshot, as it always did.
 */
export async function fetchInferredFields(
    baseUrl: string,
    modelView: string | undefined,
    initiator: HTMLElement,
): Promise<InferredField[] | null> {
    if (!modelView) return null
    try {
        const increment: any = await mateuApiClient.runAction(
            baseUrl, '', '', '__contract__', 've-contract',
            undefined, modelView, {}, {},
            initiator, true,
        )
        const fields = increment?.appData?._contract?.fields
        if (!Array.isArray(fields)) return null
        return fields
            .filter((f: any) => f && typeof f.id === 'string' && f.id)
            .map((f: any) => ({
                id: f.id,
                label: f.label ?? undefined,
                dataType: f.dataType ?? undefined,
                stereotype: f.stereotype ?? undefined,
                required: f.required ?? undefined,
                readOnly: f.readOnly ?? undefined,
            }))
    } catch {
        return null
    }
}
