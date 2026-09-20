// Screen context for the in-app assistant — the SAME projection the MCP produces (fields with
// type/label/value + the available actions), but computed on the frontend from the on-screen
// component tree. It turns the chat's context from "raw state values" into a self-describing screen,
// so the assistant knows what it can fill and what it can run — exactly like an MCP agent does.
//
// The projection rules mirror doc/.../reference/wire-specification.md (§ Agent operability) and the
// sidecar's projection.mjs. Pure (projectScreen) so it is unit-testable; the DOM lookup is a thin,
// defensive layer that degrades to null when there is no screen yet.

export interface ScreenField {
    id: string;
    label: string;
    dataType: string;
    stereotype?: string;
    required?: boolean;
    readOnly?: boolean;
    value?: unknown;
    options?: { value: unknown; label: string }[];
}

export interface ScreenAction {
    id: string;
    label: string;
    shortcut?: string;
}

export interface ScreenContext {
    title?: string;
    route?: string;
    serverSideType?: string;
    pageType?: string;
    fields: ScreenField[];
    actions: ScreenAction[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function deepVisit(node: any, fn: (n: any) => void, seen: Set<any> = new Set()): void {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    if (!Array.isArray(node)) fn(node);
    for (const v of Array.isArray(node) ? node : Object.values(node)) {
        if (v && typeof v === 'object') deepVisit(v, fn, seen);
    }
}

const mdType = (node: any): string | undefined =>
    node && node.metadata && typeof node.metadata.type === 'string' ? node.metadata.type : undefined;

/** Project a single on-screen component (a ServerSideComponent) into a flat, agent-friendly screen. */
export function projectScreen(component: any, state?: any): ScreenContext {
    if (!component || typeof component !== 'object') return { fields: [], actions: [] };

    const fieldMds: any[] = [];
    const buttonsByAction = new Map<string, string | undefined>();
    let page: any;

    deepVisit(component, (node) => {
        const t = mdType(node);
        if (t === 'FormField' && node.metadata.fieldId) fieldMds.push(node.metadata);
        else if (t === 'Page' && !page) page = node.metadata;
        else if (t === 'Button' && node.metadata.actionId) {
            if (!buttonsByAction.has(node.metadata.actionId)) {
                buttonsByAction.set(node.metadata.actionId, node.metadata.label);
            }
        }
    });

    const values =
        state && typeof state === 'object'
            ? state
            : component.initialData && typeof component.initialData === 'object'
              ? component.initialData
              : {};

    const seenField = new Set<string>();
    const fields: ScreenField[] = [];
    for (const md of fieldMds) {
        if (seenField.has(md.fieldId)) continue;
        seenField.add(md.fieldId);
        const field: ScreenField = {
            id: md.fieldId,
            label: md.label ?? md.fieldId,
            dataType: md.dataType ?? 'string',
            stereotype: md.stereotype ?? 'regular',
            required: !!md.required,
            readOnly: !!md.readOnly,
        };
        if (values && Object.prototype.hasOwnProperty.call(values, md.fieldId)) {
            field.value = values[md.fieldId];
        }
        if (Array.isArray(md.options) && md.options.length) {
            field.options = md.options.map((o: any) =>
                o && typeof o === 'object'
                    ? { value: o.value, label: o.label ?? String(o.value ?? '') }
                    : { value: o, label: String(o) },
            );
        }
        fields.push(field);
    }

    const actions: ScreenAction[] = [];
    const seenAction = new Set<string>();
    for (const a of Array.isArray(component.actions) ? component.actions : []) {
        if (!a || !a.id || seenAction.has(a.id)) continue;
        seenAction.add(a.id);
        const action: ScreenAction = { id: a.id, label: buttonsByAction.get(a.id) ?? a.id };
        if (a.shortcut) action.shortcut = a.shortcut;
        actions.push(action);
    }
    for (const [id, label] of buttonsByAction) {
        if (!seenAction.has(id)) {
            seenAction.add(id);
            actions.push({ id, label: label ?? id });
        }
    }

    const screen: ScreenContext = { fields, actions };
    const title = (page && (page.pageTitle || page.title)) || undefined;
    if (title) screen.title = title;
    if (component.route) screen.route = component.route;
    if (component.serverSideType) screen.serverSideType = component.serverSideType;
    if (component.pageType || (page && page.pageType)) screen.pageType = component.pageType || page.pageType;
    return screen;
}

/** Collect every `<mateu-component>` element across open shadow roots under `root`, in DOM order. */
function collectScreenComponents(root: Document | ShadowRoot | Element): any[] {
    const out: any[] = [];
    const walk = (node: Document | ShadowRoot | Element) => {
        const scope = (node as Element).shadowRoot ?? node;
        const els = (scope as ParentNode).querySelectorAll?.('mateu-component');
        els?.forEach((el) => {
            const component = (el as any).component;
            if (component) out.push(component);
            if ((el as Element).shadowRoot) walk(el as Element);
        });
        // also descend into any custom element with a shadow root that we did not match above
        (scope as ParentNode).querySelectorAll?.('*').forEach((el) => {
            if ((el as Element).shadowRoot && (el as Element).tagName !== 'MATEU-COMPONENT') {
                walk(el as Element);
            }
        });
    };
    walk(root);
    return out;
}

/**
 * Project the primary on-screen component. Several components may exist (the screen + embedded
 * islands); we pick the richest projection (most fields + actions), tie-broken by DOM order.
 * Returns null when there is no screen rendered yet (chat still works without it).
 */
export function projectCurrentScreen(root: Document | ShadowRoot | Element = document, state?: any): ScreenContext | null {
    let best: ScreenContext | null = null;
    let bestScore = -1;
    for (const component of collectScreenComponents(root)) {
        const screen = projectScreen(component, state);
        const score = screen.fields.length + screen.actions.length + (screen.title ? 1 : 0);
        if (score > bestScore) {
            best = screen;
            bestScore = score;
        }
    }
    return best;
}
