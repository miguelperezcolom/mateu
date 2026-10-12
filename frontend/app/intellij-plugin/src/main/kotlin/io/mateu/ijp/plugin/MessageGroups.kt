package io.mateu.ijp.plugin

/**
 * The notification group a backend message goes to. An ERROR stays until dismissed — in every
 * renderer and backend (owner, 2026-10-12) — so it goes to the sticky group; the rest are ordinary
 * balloons that fade on their own. Both groups are declared in plugin.xml.
 */
object MessageGroups {
    const val DEFAULT = "Mateu"
    const val ERRORS = "Mateu errors"

    fun groupFor(variant: String?): String = if (variant == "error") ERRORS else DEFAULT
}
