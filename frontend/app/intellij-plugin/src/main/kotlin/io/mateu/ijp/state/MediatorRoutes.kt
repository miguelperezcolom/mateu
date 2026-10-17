package io.mateu.ijp.state

/**
 * A crud mediator's state-only `_route` answer (view / cancel / save / delete) and the inner route
 * this view's own load seeded (`null` when its load carried none). The listing answers to two
 * names, `""` and `"list"` — a delete on a listing seeded with `""` answers `/list` — so that is
 * the SAME screen: stay, and let the RunAction search in the same increment refresh it, instead of
 * opening a second "list" tab. Pure; mirrors React Native's `mediatorMove`.
 */
object MediatorRoutes {
    private fun isList(r: String) = r.isEmpty() || r == "list"

    fun stays(current: String?, routeSuffix: String): Boolean {
        if (current == null) return false
        val cur = current.trim('/')
        val next = routeSuffix.trim('/')
        return cur == next || (isList(cur) && isList(next))
    }
}
