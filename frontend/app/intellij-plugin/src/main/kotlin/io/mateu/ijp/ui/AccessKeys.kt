package io.mateu.ijp.ui

import java.awt.Container
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JTabbedPane
import javax.swing.SwingUtilities

/**
 * Keyboard ACCESS KEYS (`@App(accessKeys = true)` → `AppDto.accessKeys`) on the desktop renderer.
 *
 * Swing already has the mechanism the web had to build: a button's or a tab's MNEMONIC is activated
 * with Alt+letter, and the look-and-feel underlines that letter (IntelliJ's LaF while Alt is held).
 * What Swing does not do is CHOOSE the letters, and a mnemonic that two controls share only ever
 * reaches the first — so the plugin assigns them per screen with [assign], a pure function, and
 * [refresh] applies the result to every SHOWING button and tab under a view's content root.
 */
object AccessKeys {

    /** One control asking for a key: its visible label and its declared Mateu shortcut, if any. */
    data class Item(val label: String, val shortcut: String? = null)

    /**
     * The key given to an item: the character (A–Z / 0–9) and its index in the label (the letter
     * to underline), or `-1` when the key comes from the declared shortcut, not from the label.
     */
    data class Key(val char: Char, val index: Int)

    /**
     * Assigns access keys without duplicates, in order:
     *  1. a declared `alt+<letter>` shortcut IS the item's key (reserved before anything else);
     *     any other declared shortcut keeps its own binding and gets no key;
     *  2. every remaining item tries the first letter of each word of its label;
     *  3. those still without a key try any letter of the label.
     * Letters already taken are skipped; an item whose letters are all taken gets `null`. Only
     * ASCII letters and digits qualify — they are what a Swing mnemonic (a `VK_` code) can carry.
     */
    fun assign(items: List<Item>): List<Key?> {
        val result = arrayOfNulls<Key>(items.size)
        val used = HashSet<Char>()
        val declared = BooleanArray(items.size)
        items.forEachIndexed { i, item ->
            if (!item.shortcut.isNullOrBlank()) {
                declared[i] = true
                val c = altLetter(item.shortcut)
                if (c != null && used.add(c)) result[i] = Key(c, -1)
            }
        }
        items.forEachIndexed { i, item ->
            if (declared[i]) return@forEachIndexed
            result[i] = wordInitials(item.label).firstOrNull { (c, _) -> c !in used }?.let { (c, idx) -> used.add(c); Key(c, idx) }
        }
        items.forEachIndexed { i, item ->
            if (declared[i] || result[i] != null) return@forEachIndexed
            result[i] = item.label.withIndex()
                .mapNotNull { (idx, ch) -> keyChar(ch)?.let { it to idx } }
                .firstOrNull { (c, _) -> c !in used }
                ?.let { (c, idx) -> used.add(c); Key(c, idx) }
        }
        return result.toList()
    }

    private fun keyChar(ch: Char): Char? {
        val u = ch.uppercaseChar()
        return if (u in 'A'..'Z' || u in '0'..'9') u else null
    }

    /** The first qualifying character of each word, with its index in the label. */
    private fun wordInitials(label: String): List<Pair<Char, Int>> {
        val out = ArrayList<Pair<Char, Int>>()
        var atWordStart = true
        label.forEachIndexed { idx, ch ->
            if (!ch.isLetterOrDigit()) {
                atWordStart = true
            } else if (atWordStart) {
                atWordStart = false
                keyChar(ch)?.let { out += it to idx }
            }
        }
        return out
    }

    /** `alt+s` → 'S'; any other combination (or none) → null. */
    private fun altLetter(shortcut: String): Char? {
        val parts = shortcut.lowercase().split('+').map { it.trim() }.filter { it.isNotEmpty() }
        if (parts.size != 2 || parts[0] != "alt" || parts[1].length != 1) return null
        return keyChar(parts[1][0])
    }

    // ── Swing side ──────────────────────────────────────────────────────────────────

    /** Client property carrying a button's declared Mateu shortcut (set by the button renderer). */
    const val SHORTCUT_PROPERTY = "mateu.shortcut"
    private const val ROOT_PROPERTY = "mateu.accessKeys.root"
    private const val ASSIGNED_PROPERTY = "mateu.accessKeys.assigned"
    private const val PENDING_PROPERTY = "mateu.accessKeys.pending"

    /** Re-assigns the keys of [root]'s screen once the current layout pass is done (coalesced). */
    fun scheduleRefresh(root: JComponent) {
        root.putClientProperty(ROOT_PROPERTY, true)
        if (root.getClientProperty(PENDING_PROPERTY) == true) return
        root.putClientProperty(PENDING_PROPERTY, true)
        SwingUtilities.invokeLater {
            root.putClientProperty(PENDING_PROPERTY, null)
            refresh(root)
        }
    }

    /** From inside a screen (e.g. a tab switch): refresh the enclosing view root, if one is known. */
    fun scheduleRefreshFrom(component: JComponent) {
        var c: Container? = component
        while (c != null) {
            if (c is JComponent && c.getClientProperty(ROOT_PROPERTY) == true) {
                scheduleRefresh(c)
                return
            }
            c = c.parent
        }
    }

    private sealed interface Target {
        val label: String
        val shortcut: String?
        fun apply(key: Key?)
    }

    private class ButtonTarget(val button: JButton) : Target {
        override val label: String get() = button.text.orEmpty()
        override val shortcut: String? get() = button.getClientProperty(SHORTCUT_PROPERTY) as? String
        override fun apply(key: Key?) {
            button.mnemonic = key?.char?.code ?: 0
            if (key != null && key.index >= 0) button.displayedMnemonicIndex = key.index
            button.putClientProperty(ASSIGNED_PROPERTY, if (key != null) true else null)
        }
    }

    private class TabTarget(val pane: JTabbedPane, val tab: Int) : Target {
        override val label: String get() = pane.getTitleAt(tab).orEmpty()
        override val shortcut: String? get() = null
        override fun apply(key: Key?) {
            pane.setMnemonicAt(tab, key?.char?.code ?: 0)
            if (key != null && key.index >= 0) pane.setDisplayedMnemonicIndexAt(tab, key.index)
        }
    }

    /** Assigns keys to every showing button and tab under [root], clearing the hidden ones. */
    fun refresh(root: JComponent) {
        val targets = ArrayList<Target>()
        val hidden = ArrayList<JButton>()
        fun walk(c: Container) {
            if (c is JButton) {
                if (c.isShowing) targets += ButtonTarget(c)
                else if (c.getClientProperty(ASSIGNED_PROPERTY) == true) hidden += c
            }
            if (c is JTabbedPane && c.isShowing) {
                for (i in 0 until c.tabCount) targets += TabTarget(c, i)
            }
            for (child in c.components) if (child is Container) walk(child)
        }
        walk(root)
        // a hidden button (a tab not selected, a closed panel) must not keep a letter the visible
        // screen may now hand to somebody else
        for (b in hidden) ButtonTarget(b).apply(null)
        val keys = assign(targets.map { Item(it.label, it.shortcut) })
        targets.forEachIndexed { i, t -> t.apply(keys[i]) }
    }
}
