import { describe, it, expect } from 'vitest'
import {
    javaTypeForDataType, isValidJavaIdentifier, extractBindings, simpleName,
    declaresClass, isRecord, hasField, computeFieldInsertion,
} from './createInViewModel'

describe('createInViewModel core', () => {
    it('maps wire dataTypes to Java types (unknown → String)', () => {
        expect(javaTypeForDataType('integer')).toBe('Integer')
        expect(javaTypeForDataType('number')).toBe('Double')
        expect(javaTypeForDataType('bool')).toBe('Boolean')
        expect(javaTypeForDataType('date')).toBe('java.time.LocalDate')
        expect(javaTypeForDataType('money')).toBe('java.math.BigDecimal')
        expect(javaTypeForDataType(undefined)).toBe('String')
        expect(javaTypeForDataType('weird')).toBe('String')
    })

    it('validates Java identifiers', () => {
        expect(isValidJavaIdentifier('name')).toBe(true)
        expect(isValidJavaIdentifier('_id$2')).toBe(true)
        expect(isValidJavaIdentifier('2bad')).toBe(false)
        expect(isValidJavaIdentifier('has space')).toBe(false)
        expect(isValidJavaIdentifier('')).toBe(false)
    })

    it('extracts the modelView + FormField bindings from an envelope page, walking nested layout', () => {
        const yaml = [
            'modelView: com.acme.PersonView',
            'layout:',
            '  type: VerticalLayout',
            '  content:',
            '    - type: Text',
            '      text: hi',
            '    - type: FormLayout',
            '      content:',
            '        - type: FormField',
            '          id: name',
            '          label: Name',
            '        - type: FormField',
            '          id: age',
            '          dataType: integer',
        ].join('\n')
        const b = extractBindings(yaml)
        expect(b.modelView).toBe('com.acme.PersonView')
        expect(b.fields).toEqual([{ id: 'name', dataType: undefined }, { id: 'age', dataType: 'integer' }])
    })

    it('finds a FormField inside a Slotted (single-object content) and a bare tree, de-duplicating', () => {
        const yaml = [
            'type: ResponsiveGrid',
            'content:',
            '  - type: Slotted',
            '    slot: main',
            '    content:',
            '      type: FormField',
            '      id: email',
            '      dataType: string',
        ].join('\n')
        const b = extractBindings(yaml)
        expect(b.modelView).toBeUndefined()
        expect(b.fields).toEqual([{ id: 'email', dataType: 'string' }])
    })

    it('tolerates unparseable YAML', () => {
        expect(extractBindings(': : [')).toEqual({ fields: [] })
    })

    it('simpleName handles packages and nested classes', () => {
        expect(simpleName('com.acme.PersonView')).toBe('PersonView')
        expect(simpleName('com.acme.Outer$Inner')).toBe('Inner')
        expect(simpleName('Bare')).toBe('Bare')
    })

    it('declaresClass matches package + type name', () => {
        const src = 'package com.acme;\n\npublic class PersonView {\n}\n'
        expect(declaresClass(src, 'com.acme.PersonView')).toBe(true)
        expect(declaresClass(src, 'com.other.PersonView')).toBe(false) // wrong package
        expect(declaresClass(src, 'com.acme.Other')).toBe(false)       // wrong name
    })

    it('computes an insertion after the class brace, refusing records and existing fields', () => {
        const src = 'package com.acme;\n\npublic class PersonView {\n    private String existing;\n}\n'
        const ins = computeFieldInsertion(src, 'com.acme.PersonView', 'name', 'String')!
        expect(ins).not.toBeNull()
        const applied = src.slice(0, ins.index) + ins.text + src.slice(ins.index)
        expect(applied).toContain('private String name;')
        // the field lands inside the body, right after the opening brace
        expect(applied.indexOf('private String name;')).toBeLessThan(applied.indexOf('private String existing;'))

        // already present → no insertion
        expect(computeFieldInsertion(src, 'com.acme.PersonView', 'existing', 'String')).toBeNull()
        // record → refused (no addable instance field)
        const rec = 'package com.acme;\n\npublic record PersonView(String name) {\n}\n'
        expect(isRecord(rec, 'PersonView')).toBe(true)
        expect(computeFieldInsertion(rec, 'com.acme.PersonView', 'age', 'Integer')).toBeNull()
        // invalid identifier → refused
        expect(computeFieldInsertion(src, 'com.acme.PersonView', '2bad', 'String')).toBeNull()
    })

    it('hasField sees plain fields and record components', () => {
        expect(hasField('private String name;', 'name')).toBe(true)
        expect(hasField('record P(String name, int age) {}', 'age')).toBe(true)
        expect(hasField('private String other;', 'name')).toBe(false)
    })
})
