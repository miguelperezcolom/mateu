/**
 * Undo/redo over the edited FILE TEXT. Text (not the in-memory model) is the unit because it is the
 * one thing every editor mode shares — page canvas, routes table, app shell, mount — so a single
 * history covers them all, and an undo restores exactly what would be saved.
 *
 * Bursts of edits to the same thing (typing in a property field fires a change per commit, a drag
 * fires one per drop) are not coalesced here: each committed change is one step, which is what the
 * IDEs do for discrete edits. The stack is bounded.
 */
export class EditHistory {
    private past: string[] = []
    private future: string[] = []

    constructor(private current: string, private readonly limit = 200) {}

    /** Start over from `text` (a newly opened file, or a change made outside the editor). */
    reset(text: string) {
        this.current = text
        this.past = []
        this.future = []
    }

    /** Record that the text became `text`. A no-op for an identical text. */
    push(text: string) {
        if (text === this.current) return
        this.past.push(this.current)
        if (this.past.length > this.limit) this.past.shift()
        this.current = text
        this.future = []
    }

    undo(): string | undefined {
        const prev = this.past.pop()
        if (prev === undefined) return undefined
        this.future.push(this.current)
        this.current = prev
        return prev
    }

    redo(): string | undefined {
        const next = this.future.pop()
        if (next === undefined) return undefined
        this.past.push(this.current)
        this.current = next
        return next
    }

    get canUndo() { return this.past.length > 0 }
    get canRedo() { return this.future.length > 0 }
    get text() { return this.current }
}
