// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { projectCurrentScreen } from './screenContext';

// Verifies the DOM lookup (collectScreenComponents + pick-the-richest), including piercing an open
// shadow root — the pure projection itself is covered by screenContext.test.ts.

/* eslint-disable @typescript-eslint/no-explicit-any */
function mateuComponent(component: unknown): HTMLElement {
    const el = document.createElement('mateu-component');
    (el as any).component = component;
    return el;
}

const formComponent = (fieldIds: string[]) => ({
    type: 'ServerSide',
    route: 'r',
    serverSideType: 'com.acme.X',
    children: fieldIds.map((id) => ({
        type: 'ClientSide',
        metadata: { type: 'FormField', fieldId: id, label: id, dataType: 'string' },
    })),
});

describe('projectCurrentScreen (DOM)', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('returns null when there is no screen component', () => {
        expect(projectCurrentScreen(document)).toBeNull();
    });

    it('finds a mateu-component in the light DOM', () => {
        document.body.appendChild(mateuComponent(formComponent(['name', 'age'])));
        const screen = projectCurrentScreen(document);
        expect(screen?.fields.map((f) => f.id)).toEqual(['name', 'age']);
    });

    it('pierces an open shadow root to find the component', () => {
        const host = document.createElement('mateu-ux');
        const shadow = host.attachShadow({ mode: 'open' });
        shadow.appendChild(mateuComponent(formComponent(['email'])));
        document.body.appendChild(host);
        const screen = projectCurrentScreen(document);
        expect(screen?.fields.map((f) => f.id)).toEqual(['email']);
    });

    it('picks the richest screen when several components exist (screen vs island)', () => {
        document.body.appendChild(mateuComponent(formComponent(['only'])));       // small island
        document.body.appendChild(mateuComponent(formComponent(['a', 'b', 'c']))); // main screen
        const screen = projectCurrentScreen(document);
        expect(screen?.fields.map((f) => f.id)).toEqual(['a', 'b', 'c']);
    });
});
