// The editor's node-id stamping switch (see nodeIdStamp.ts), on its own so code that only READS it
// — the client-side expander, which the native renderer shares — does not pull Lit in.
let stamping = false

export const setNodeIdStamping = (on: boolean): void => { stamping = on }
export const isNodeIdStamping = (): boolean => stamping
