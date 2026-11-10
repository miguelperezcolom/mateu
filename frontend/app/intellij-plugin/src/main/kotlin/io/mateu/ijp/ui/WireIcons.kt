package io.mateu.ijp.ui

import com.intellij.icons.AllIcons
import javax.swing.Icon

/**
 * The wire's icon tokens (Vaadin's icon set: `vaadin:calendar`, `lumo:plus`, or a bare `calendar`) on
 * the desktop. An icon the IDE has a glyph for is that glyph ([wireIcon]); the rest get a text symbol
 * ([wireIconGlyph]) — an Icon used to print its NAME ("calendar", "airplane") where the web drew a
 * picture, and a button's iconOnLeft/iconOnRight were dropped altogether.
 */
object WireIcons {
    /** `vaadin:calendar-clock` → `calendar-clock`; an emoji or empty token → itself. */
    fun bareName(token: String): String = token.trim().substringAfter(':').lowercase()

    /** Whether the token is an icon NAME (not an emoji / a glyph the wire sends to be shown as is). */
    fun isName(token: String): Boolean = token.isNotBlank() && Regex("""^([a-z]+:)?[a-z0-9-]+$""").matches(token.trim().lowercase())

    fun icon(token: String): Icon? = when (bareName(token)) {
        "pencil", "pen", "edit" -> AllIcons.Actions.Edit
        "ban", "close", "close-small", "close-big", "cross" -> AllIcons.Actions.Cancel
        "check", "check-circle", "checkmark" -> AllIcons.Actions.Checked
        "barcode", "search" -> AllIcons.Actions.Search
        "rotate-left", "refresh", "rotate-right" -> AllIcons.Actions.Refresh
        "trash" -> AllIcons.Actions.GC
        "plus", "plus-circle" -> AllIcons.General.Add
        "minus", "minus-circle" -> AllIcons.General.Remove
        "exchange" -> AllIcons.Actions.SwapPanels
        "wifi", "globe", "globe-wire", "world" -> AllIcons.General.Web
        "key", "lock" -> AllIcons.CodeWithMe.CwmPermissions
        "credit-card" -> AllIcons.Actions.Commit
        "gift", "star", "star-o" -> AllIcons.Nodes.Favorite
        "arrow-right", "angle-right", "chevron-right" -> AllIcons.General.ArrowRight
        "arrow-left", "angle-left", "chevron-left" -> AllIcons.General.ArrowLeft
        "arrow-up", "angle-up", "chevron-up" -> AllIcons.General.ArrowUp
        "arrow-down", "angle-down", "chevron-down" -> AllIcons.General.ArrowDown
        "cog", "cogs", "settings", "tools", "wrench" -> AllIcons.General.Settings
        "user", "users", "user-card", "group" -> AllIcons.General.User
        "info", "info-circle" -> AllIcons.General.Information
        "warning", "exclamation-circle", "exclamation-triangle" -> AllIcons.General.Warning
        "close-circle", "error" -> AllIcons.General.Error
        "download", "download-alt" -> AllIcons.Actions.Download
        "upload", "upload-alt" -> AllIcons.Actions.Upload
        "copy", "copy-o" -> AllIcons.Actions.Copy
        "eye" -> AllIcons.Actions.Show
        "filter" -> AllIcons.General.Filter
        "folder", "folder-open" -> AllIcons.Nodes.Folder
        "file", "file-text", "file-o", "file-text-o" -> AllIcons.FileTypes.Text
        "question", "question-circle" -> AllIcons.Actions.Help
        "bell" -> AllIcons.Toolwindows.Notifications
        "home" -> AllIcons.Nodes.HomeFolder
        "list", "list-ul", "list-select", "menu" -> AllIcons.Actions.ListFiles
        "play", "play-circle" -> AllIcons.Actions.Execute
        "stop" -> AllIcons.Actions.Suspend
        "external-link" -> AllIcons.Ide.External_link_arrow
        else -> null
    }

    /** A text symbol for the icons the IDE has no glyph for (never the icon's name). */
    fun glyph(token: String): String? = when (bareName(token)) {
        "calendar", "calendar-o", "calendar-clock", "date-input" -> "📅"
        "clock", "time-forward", "hourglass" -> "🕒"
        "airplane", "flight-takeoff", "flight-landing" -> "✈"
        "car", "taxi" -> "🚗"
        "truck" -> "🚚"
        "bed" -> "🛏"
        "coffee", "cutlery", "food" -> "☕"
        "suitcase", "briefcase" -> "🧳"
        "phone", "mobile" -> "☎"
        "envelope", "envelope-o", "mail" -> "✉"
        "heart", "heart-o" -> "♥"
        "map-marker", "location-arrow" -> "📍"
        "money", "euro", "dollar", "cash" -> "💶"
        "chart", "bar-chart", "line-chart", "pie-chart" -> "📊"
        "building", "office", "institution" -> "🏢"
        "camera" -> "📷"
        "picture", "image" -> "🖼"
        "flag", "flag-o" -> "⚑"
        "tag", "tags" -> "🏷"
        "comment", "comments", "chat" -> "💬"
        "bolt", "flash" -> "⚡"
        "sun-o", "sun" -> "☀"
        "moon", "moon-o" -> "☾"
        else -> null
    }
}

/** The IDE glyph of a wire icon token, or null (see [WireIcons]). */
internal fun wireIcon(token: String): Icon? = if (token.isBlank()) null else WireIcons.icon(token)

/**
 * What a wire icon token shows as text when it has no IDE glyph: a known symbol, the token itself
 * when it already IS a glyph (an emoji), or nothing — never the icon's bare name.
 */
internal fun wireIconText(token: String): String? = when {
    token.isBlank() -> null
    WireIcons.isName(token) -> WireIcons.glyph(token)
    else -> token
}
