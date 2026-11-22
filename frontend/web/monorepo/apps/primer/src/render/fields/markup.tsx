import React, { useState } from 'react'
import { SegmentedControl, Text, Textarea } from '@primer/react'
import { Markdown, SafeHtml } from '../Markdown'

type Kind = 'markdown' | 'html' | 'richText'

/** A markdown / HTML / rich-text value drawn (sanitized by the shared data-HTML policy). */
export function RichValue({ value, kind }: { value: string; kind: Kind }) {
  if (!value.trim()) return <Text>—</Text>
  return kind === 'markdown' ? <Markdown source={value} /> : <SafeHtml html={value} />
}

/**
 * The web renderers' source + Preview editor (mateu-markup-editor): the source in a textarea, and
 * a Preview tab that draws it. A rich-text value is HTML (the Vaadin editor's value), written as source.
 */
export function MarkupEditor({ kind, value, onChange, a11y, inputRef, placeholder, validationStatus }: {
  kind: Kind; value: string; onChange: (v: string) => void
  a11y?: Record<string, unknown>; inputRef?: React.Ref<HTMLTextAreaElement>; placeholder?: string; validationStatus?: 'error'
}) {
  const [preview, setPreview] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--base-size-8)' }}>
      <div style={{ alignSelf: 'flex-start' }}>
      <SegmentedControl aria-label="Editor mode" size="small" onChange={(i) => setPreview(i === 1)}>
        <SegmentedControl.Button selected={!preview}>{kind === 'markdown' ? 'Markdown' : 'HTML'}</SegmentedControl.Button>
        <SegmentedControl.Button selected={preview}>Preview</SegmentedControl.Button>
      </SegmentedControl>
      </div>
      {preview ? (
        <div className="mateu-markup-preview">
          {value.trim() ? <RichValue value={value} kind={kind} /> : <Text style={{ color: 'var(--fgColor-muted)' }}>Nothing to preview</Text>}
        </div>
      ) : (
        <Textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          block
          rows={8}
          placeholder={placeholder}
          validationStatus={validationStatus}
          style={{ fontFamily: 'var(--fontStack-monospace)' }}
          {...a11y}
        />
      )}
    </div>
  )
}
