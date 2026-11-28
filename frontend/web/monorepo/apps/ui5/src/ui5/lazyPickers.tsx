import React from 'react'
import { Input } from '@ui5/webcomponents-react'

type Pickers = typeof import('@app/ui5/pickers')
type Name = keyof Pickers

const cache = new Map<Name, React.ComponentType<Record<string, unknown>>>()

/** A picker from the lazy pickers chunk; until it arrives, a read-only input with the value in place. */
export function lazyPicker(name: Name): React.ComponentType<Record<string, unknown>> {
  let C = cache.get(name)
  if (!C) {
    const L = React.lazy(() => import('@app/ui5/pickers').then((m) => ({ default: m[name] as unknown as React.ComponentType<Record<string, unknown>> })))
    C = function LazyPicker(props: Record<string, unknown>) {
      return (
        <React.Suspense fallback={<Input readonly value={String(props['value'] ?? '')} style={props['style'] as React.CSSProperties} />}>
          <L {...props} />
        </React.Suspense>
      )
    }
    cache.set(name, C)
  }
  return C
}
