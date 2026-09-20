package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import javax.swing.JComponent

/**
 * Custom components (coherence-plan #14) on the IntelliJ renderer — the per-renderer escape hatch. A
 * plugin registers a renderer against a custom type `name`; the wire carries `CustomComponent(name,
 * props, content)` and the dispatcher ([ComponentRenderer]) looks the name up here. Where none is
 * registered it degrades to a visible placeholder that still shows the slotted children — the desktop
 * twin of the web's `registerCustomComponent` / `<mateu-unsupported>`.
 *
 * A renderer receives the component `metadata` (carrying `props`) and the already-rendered slotted
 * children, so a custom shell can wrap known components.
 */
object CustomComponentRegistry {

    private val registry = HashMap<String, (JsonNode, JComponent) -> JComponent>()

    /** Register a renderer for a custom component type [name]. A later registration replaces an earlier. */
    fun register(name: String, renderer: (JsonNode, JComponent) -> JComponent) {
        registry[name] = renderer
    }

    /** The renderer registered for [name], or null when none is registered. */
    fun resolve(name: String): ((JsonNode, JComponent) -> JComponent)? = registry[name]
}
