// Register the shared root renderer element and wire the DS-neutral renderer + notifier. The canvas
// may then switch to the Vaadin reference renderer (lazily loaded) — see canvas/canvasRenderer.ts.
import '@infra/ui/mateu-ux.ts'
import { installNeutralRenderer } from './canvas/canvasRenderer'

installNeutralRenderer()

// The editor UI (registers <mateu-visual-editor> and its child panels).
import './mateu-visual-editor.ts'
