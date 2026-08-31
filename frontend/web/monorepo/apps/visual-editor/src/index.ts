// Register the shared root renderer element and wire the DS-neutral renderer + notifier.
import '@infra/ui/mateu-ux.ts'
import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer.ts'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer.ts'
import { registerNeutralNotifier } from '@infra/notify/neutralNotifier.ts'

/** A concrete DS-neutral renderer (BasicComponentRenderer implements the whole surface). */
class NeutralRenderer extends BasicComponentRenderer {}

componentRenderer.set(new NeutralRenderer())
registerNeutralNotifier()

// The editor UI (registers <mateu-visual-editor> and its child panels).
import './mateu-visual-editor.ts'
