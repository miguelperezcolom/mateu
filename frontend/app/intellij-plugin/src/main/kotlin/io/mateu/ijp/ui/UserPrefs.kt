package io.mateu.ijp.ui

import com.intellij.ide.util.PropertiesComponent
import com.intellij.openapi.application.ApplicationManager

/**
 * Per-user string preferences (column chooser, saved views…), stored in the IDE's
 * [PropertiesComponent]. Without a running IDE Application — unit tests and the headless
 * render probe — `PropertiesComponent.getInstance()` throws, which used to abort the whole crud
 * render; there the values live in memory for the life of the process instead.
 */
internal object UserPrefs {
    private val memory = HashMap<String, String>()

    private fun store(): PropertiesComponent? =
        if (ApplicationManager.getApplication() == null) null
        else runCatching { PropertiesComponent.getInstance() }.getOrNull()

    fun get(key: String): String? = store()?.getValue(key) ?: synchronized(memory) { memory[key] }

    fun set(key: String, value: String) {
        val pc = store()
        if (pc != null) pc.setValue(key, value) else synchronized(memory) { memory[key] = value }
    }

    fun unset(key: String) {
        val pc = store()
        if (pc != null) pc.unsetValue(key) else synchronized(memory) { memory.remove(key) }
    }
}
