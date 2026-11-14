package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import java.util.Locale

/**
 * The signed-in user of the app shell (`AppDto.user`), the pure part — a mirror of libs/mateu's
 * `userMenu.ts` (same rules, same cases in its test): what the avatar shows and whether the
 * navigator draws the user menu, the bare Sign out, or nothing. The Swing side is [userMenuRow].
 */
object UserMenu {

    /** `AppDto.user` (`UserProfileDto`): display only — the server's identity decides access. */
    data class User(val name: String, val email: String? = null, val picture: String? = null)

    enum class Control { MENU, SIGN_OUT, NONE }

    /** The App metadata's `user`, null when absent (an anonymous caller) or nameless. */
    fun of(metadata: JsonNode): User? {
        val u = metadata.path("user")
        if (!u.isObject) return null
        fun str(key: String) = u.path(key).takeIf { it.isTextual }?.asText()?.takeIf { it.isNotBlank() }
        val name = str("name") ?: return null
        return User(name, str("email"), str("picture"))
    }

    private val SEPARATORS = Regex("(?U)[\\s._-]+")
    private val LETTER_OR_DIGIT = Regex("[\\p{L}\\p{N}]")

    private fun firstLetterOf(word: String): String =
        word.codePoints().toArray().map { String(Character.toChars(it)) }.firstOrNull { LETTER_OR_DIGIT.matches(it) } ?: ""

    /**
     * Up to two initials: the first letter of the first and of the last word ("Ana María López" →
     * "AL", "miguelperezcolom" → "M"). Letters of any script; an e-mail-like name uses its local part.
     */
    fun initialsOf(name: String): String {
        val base = if (name.contains('@') && !name.contains(' ')) name.substringBefore('@') else name
        val words = base.split(SEPARATORS).filter { LETTER_OR_DIGIT.containsMatchIn(it) }
        if (words.isEmpty()) return "?"
        val first = firstLetterOf(words.first())
        if (words.size == 1) return first.uppercase()
        return (first + firstLetterOf(words.last())).uppercase()
    }

    /** Only an http(s) picture is drawn; anything else falls back to the initials. */
    fun pictureOf(user: User): String? {
        val url = user.picture?.trim()
        return if (!url.isNullOrEmpty() && Regex("^https?://", RegexOption.IGNORE_CASE).containsMatchIn(url)) url else null
    }

    /**
     * Which control the shell draws: the user menu when the server named the signed-in user (Sign
     * out inside it when the plugin holds the session), the bare Sign out when it did not but there
     * is a session to end, nothing otherwise.
     */
    fun headerAccountControl(user: User?, signOutAvailable: Boolean): Control = when {
        !user?.name.isNullOrEmpty() -> Control.MENU
        signOutAvailable -> Control.SIGN_OUT
        else -> Control.NONE
    }

    /** The chrome's words for it — the web's `userMenuOf` / `signOut`, in its six languages. */
    data class Texts(val accountOf: String, val signOut: String) {
        fun accountLabel(name: String) = accountOf.replace("{name}", name)
    }

    private val TEXTS = mapOf(
        "en" to Texts("Account: {name}", "Sign out"),
        "es" to Texts("Cuenta: {name}", "Cerrar sesión"),
        "fr" to Texts("Compte : {name}", "Se déconnecter"),
        "de" to Texts("Konto: {name}", "Abmelden"),
        "pt" to Texts("Conta: {name}", "Terminar sessão"),
        "it" to Texts("Account: {name}", "Esci"),
    )

    fun texts(locale: Locale?): Texts = ChromeLanguage.pick(locale, TEXTS)
}
