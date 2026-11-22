import React, { useEffect, useRef, useState } from 'react'
import { IconButton, Stack, Text, TextInput, Token, Button } from '@kit'
import { SearchIcon } from '@kit/icons'
import { lookupLabelOf } from '@rn/core/readOnlyDisplay'
import { removeSearchableId, searchableChips, searchableIds } from '@infra/ui/searchableMulti.ts'
import { useController } from '@mr/render/ViewHost'
import { tx } from '@mr/i18n/texts'

type Dict = Record<string, unknown>
type A11y = { 'aria-labelledby': string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }

/**
 * A single @Searchable field (stereotype `searchable`) — the web renderer's grammar: a short CODE
 * box (typing a code runs `code-<field>` with `{code}`, and the server answers the row's label),
 * the label it resolved (data `<field>-label`, read-only) and a search button that runs
 * `codesearch-<field>`: the server answers the field's selector Listing in a Dialog, and the row
 * picked there (`action-on-row-select`) comes back as this field's value and label.
 */
export function SearchableField({ fieldId, label, value, editable, a11y, buttonRef }: {
  fieldId: string; label: string; value: string; editable: boolean; a11y: A11y; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  const controller = useController()
  const resolved = lookupLabelOf(controller.rendered.data, controller.rendered.state as Dict, fieldId) ?? ''
  const [code, setCode] = useState(value)
  // the code last asked about: Enter then leaving the box asks once
  const asked = useRef(value)
  useEffect(() => { setCode(value); asked.current = value }, [value])
  if (!editable) return <Text>{resolved || value || '—'}</Text>
  const runCode = () => {
    if (code === value || code === asked.current) return
    asked.current = code
    void controller.runAction(`code-${fieldId}`, { code })
  }
  return (
    <Stack direction="horizontal" gap="condensed" align="center" {...a11y} role="group">
      <TextInput
        aria-label={`${label} — code`}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onBlur={runCode}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runCode() } }}
        style={{ width: '6rem' }}
      />
      <TextInput aria-label={label} value={resolved} readOnly block placeholder="—" />
      <IconButton
        ref={buttonRef}
        icon={SearchIcon}
        aria-label={tx('searchNamed', { name: label })}
        onClick={() => void controller.runAction(`codesearch-${fieldId}`, {})}
      />
    </Stack>
  )
}

/**
 * A multi-valued @Searchable (stereotype `searchable`, dataType `array`): one token per id
 * (labelled from data `<field>-labels`), each removable, and «Add» opening the selector — whose
 * pick answers the merged ids. Read-only: the tokens alone.
 */
export function SearchableMultiField({ fieldId, label, value, editable, onChange, a11y, buttonRef }: {
  fieldId: string; label: string; value: unknown; editable: boolean; onChange: (ids: unknown[]) => void; a11y: A11y; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  const controller = useController()
  const data = (controller.rendered.data ?? {}) as Dict
  const ids = searchableIds(value)
  const chips = searchableChips(ids, data[`${fieldId}-labels`])
  const fallback = typeof data[`${fieldId}-label`] === 'string' ? String(data[`${fieldId}-label`]) : ''
  return (
    <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center" role="list" {...a11y}>
      {chips.map((chip) => (
        <span role="listitem" key={String(chip.id)}>
          <Token
            text={chip.label}
            onRemove={editable ? () => onChange(removeSearchableId(ids, chip.id)) : undefined}
          />
        </span>
      ))}
      {!editable && chips.length === 0 && <Text>{fallback || '—'}</Text>}
      {editable && (
        <Button ref={buttonRef} size="small" variant="invisible" leadingVisual={SearchIcon} onClick={() => void controller.runAction(`codesearch-${fieldId}`, {})}>
          Add
        </Button>
      )}
      {editable && chips.length === 0 && <span className="sr-only">{label}: none</span>}
    </Stack>
  )
}
