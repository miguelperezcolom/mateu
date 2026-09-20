import { describe, it, expect } from 'vitest';
import { projectScreen } from './screenContext';

// The pure projection is the frontend twin of the MCP projection: same self-describing screen
// (fields with type/label/value + actions) from the same component-tree shape.

describe('projectScreen', () => {
    it('extracts fields with types, options and values from state', () => {
        const component = {
            type: 'ServerSide',
            route: 'simple',
            serverSideType: 'com.acme.Simple',
            pageType: 'form',
            children: [
                {
                    type: 'ClientSide',
                    metadata: { type: 'Page', pageTitle: 'Simple', subtitle: 'x' },
                    children: [
                        { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'name', label: 'Name', dataType: 'string', required: true } },
                        {
                            type: 'ClientSide',
                            metadata: {
                                type: 'FormField', fieldId: 'colour', label: 'Colour', stereotype: 'select',
                                options: [{ value: 'red', label: 'red' }, { value: 'green', label: 'green' }],
                            },
                        },
                    ],
                },
            ],
        };
        const screen = projectScreen(component, { name: 'Ada', colour: 'green' });
        expect(screen.title).toBe('Simple');
        expect(screen.route).toBe('simple');
        expect(screen.pageType).toBe('form');
        const byId = Object.fromEntries(screen.fields.map((f) => [f.id, f]));
        expect(byId.name.dataType).toBe('string');
        expect(byId.name.required).toBe(true);
        expect(byId.name.value).toBe('Ada');
        expect(byId.colour.stereotype).toBe('select');
        expect(byId.colour.options?.map((o) => o.value)).toEqual(['red', 'green']);
    });

    it('lists actions from component.actions, labels enriched from buttons', () => {
        const component = {
            type: 'ServerSide',
            actions: [{ id: 'save', shortcut: 'ctrl+s' }, { id: 'cancel' }],
            children: [
                { type: 'ClientSide', metadata: { type: 'Button', actionId: 'save', label: 'Guardar' } },
            ],
        };
        const screen = projectScreen(component, {});
        const byId = Object.fromEntries(screen.actions.map((a) => [a.id, a]));
        expect(byId.save.label).toBe('Guardar');
        expect(byId.save.shortcut).toBe('ctrl+s');
        expect(byId.cancel.label).toBe('cancel');
    });

    it('surfaces a toolbar-only button as an action even without a declared action', () => {
        const component = {
            type: 'ServerSide',
            children: [
                { type: 'ClientSide', metadata: { type: 'Button', actionId: 'export', label: 'Export' } },
            ],
        };
        const screen = projectScreen(component, {});
        expect(screen.actions).toEqual([{ id: 'export', label: 'Export' }]);
    });

    it('falls back to initialData when no state is given', () => {
        const component = {
            type: 'ServerSide',
            initialData: { name: 'Bob' },
            children: [{ type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'name', label: 'Name', dataType: 'string' } }],
        };
        const screen = projectScreen(component);
        expect(screen.fields[0].value).toBe('Bob');
    });

    it('de-duplicates fields by id, declaration order', () => {
        const component = {
            type: 'ServerSide',
            children: [
                { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'a', label: 'A', dataType: 'string' } },
                { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'b', label: 'B', dataType: 'string' } },
                { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'a', label: 'A2', dataType: 'string' } },
            ],
        };
        const screen = projectScreen(component, {});
        expect(screen.fields.map((f) => f.id)).toEqual(['a', 'b']);
    });

    it('is defensive: null / empty component yield an empty screen', () => {
        expect(projectScreen(null)).toEqual({ fields: [], actions: [] });
        expect(projectScreen({})).toEqual({ fields: [], actions: [] });
    });
});
