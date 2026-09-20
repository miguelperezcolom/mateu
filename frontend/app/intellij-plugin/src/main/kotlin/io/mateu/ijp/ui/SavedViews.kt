package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.ide.util.PropertiesComponent

/**
 * Saved views for a crud listing — parity with the web `savedViewsStore`: named snapshots of the
 * search conditions (searchText + filter state keys, range bounds included), one optionally the
 * default (auto-applied on first load), persisted per crud route in [PropertiesComponent].
 *
 * Serialized as a JSON array of plain maps via a Java-shaped ObjectMapper (no Kotlin databind module
 * needed): each entry is {name, values(map), isDefault}.
 */
object SavedViews {

    private val mapper = ObjectMapper()
    private fun key(scope: String) = "mateu.views.${scope.ifBlank { "_" }}"

    class View(val name: String, val values: Map<String, Any?>, val isDefault: Boolean)

    fun list(scope: String): List<View> {
        val raw = PropertiesComponent.getInstance().getValue(key(scope)) ?: return emptyList()
        return runCatching {
            (mapper.readValue(raw, List::class.java) as List<*>).mapNotNull { e ->
                val m = e as? Map<*, *> ?: return@mapNotNull null
                val name = m["name"] as? String ?: return@mapNotNull null
                @Suppress("UNCHECKED_CAST")
                View(name, (m["values"] as? Map<String, Any?>) ?: emptyMap(), m["isDefault"] == true)
            }
        }.getOrDefault(emptyList())
    }

    private fun persist(scope: String, views: List<View>) {
        val pc = PropertiesComponent.getInstance()
        if (views.isEmpty()) {
            pc.unsetValue(key(scope))
            return
        }
        val arr = views.map { mapOf("name" to it.name, "values" to it.values, "isDefault" to it.isDefault) }
        pc.setValue(key(scope), mapper.writeValueAsString(arr))
    }

    /** Save (or replace, matching by name) a view. Empty name / empty snapshot ignored. */
    fun save(scope: String, name: String, values: Map<String, Any?>) {
        val n = name.trim()
        if (n.isEmpty() || values.isEmpty()) return
        val views = list(scope).filter { it.name != n }.toMutableList()
        views.add(View(n, values, false))
        persist(scope, views)
    }

    fun delete(scope: String, name: String) = persist(scope, list(scope).filter { it.name != name })

    /** Toggle the default flag on [name], clearing it from every other view in the scope. */
    fun toggleDefault(scope: String, name: String) =
        persist(scope, list(scope).map { View(it.name, it.values, if (it.name == name) !it.isDefault else false) })

    fun default(scope: String): View? = list(scope).firstOrNull { it.isDefault }
}
