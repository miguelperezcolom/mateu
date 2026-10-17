package io.mateu.ijp.state

import javax.swing.KeyStroke

/** Mateu shortcut spellings (`@Action(shortcut = "ctrl+alt+d")`) as Swing key strokes. */
object ShortcutKeys {
    /** Mateu's "ctrl+alt+d" → a Swing [KeyStroke] ("ctrl alt D"); null when unparseable. */
    fun keyStroke(shortcut: String): KeyStroke? {
        if (shortcut.isBlank()) return null
        val parts = shortcut.lowercase().split('+').map { it.trim() }.filter { it.isNotEmpty() }
        if (parts.isEmpty()) return null
        val mods = parts.dropLast(1).map {
            when (it) {
                "ctrl", "control" -> "ctrl"
                "alt" -> "alt"
                "shift" -> "shift"
                "meta", "cmd" -> "meta"
                else -> return null
            }
        }
        val key = when (val k = parts.last()) {
            "enter" -> "ENTER"
            "esc", "escape" -> "ESCAPE"
            "space" -> "SPACE"
            "del", "delete" -> "DELETE"
            "tab" -> "TAB"
            else -> k.uppercase()
        }
        return KeyStroke.getKeyStroke((mods + key).joinToString(" "))
    }
}
