package io.mateu.ijp.state

/**
 * Where an app shell loads a piece of CONTENT from, and which view it names there — the port of
 * libs/mateu `appContentTarget.ts` (and React Native `core/homeTarget.ts`). Pure, so the rules a
 * federated shell depends on are pinned by tests.
 *
 * - The shell's HOME lives where the shell is, unless the server mounted a REMOTE screen as the home
 *   (a fresh deep link to a remote route): then `homeBaseUrl` is ABSOLUTE and wins. Loading it from
 *   the shell's own backend with the remote's view type answered 403.
 * - A menu option of another backend (its own `baseUrl`) names its own view type or NONE (a
 *   YAML-only remote has no view class): never the shell's, which the remote refuses.
 */
object ContentTarget {

    /** The backend the home is loaded from: an absolute `homeBaseUrl` other than [shellBase], else the shell's. */
    fun homeBase(homeBaseUrl: String?, shellBase: String): String =
        homeBaseUrl?.trim()?.takeIf { it.contains("://") }?.trimEnd('/') ?: shellBase

    /** The backend a menu option is loaded from: its own `baseUrl` when it names one, else the shell's. */
    fun optionBase(optionBaseUrl: String?, shellBase: String): String =
        optionBaseUrl?.trim()?.takeIf { it.isNotBlank() }?.trimEnd('/') ?: shellBase

    /** Whether [base] is another backend than the shell's. */
    fun isForeign(base: String?, shellBase: String): Boolean =
        !base.isNullOrBlank() && base.trimEnd('/') != shellBase.trimEnd('/')

    /**
     * The view type a menu option's load names: its own; else — only for an option of the shell's
     * own backend — the shell's type; for another backend's, none.
     */
    fun optionServerSideType(optionType: String?, optionBaseUrl: String?, shellBase: String, shellType: String?): String? {
        if (!optionType.isNullOrBlank()) return optionType
        return if (isForeign(optionBaseUrl, shellBase)) null else shellType
    }
}
