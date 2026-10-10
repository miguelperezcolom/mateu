package io.mateu.ijp.auth

import com.intellij.credentialStore.CredentialAttributes
import com.intellij.credentialStore.Credentials
import com.intellij.credentialStore.generateServiceName
import com.intellij.ide.passwordSafe.PasswordSafe

/**
 * Mateu secrets in the IDE's credential store (macOS Keychain / KWallet / KeePass, per the user's
 * IDE settings) — never in `.idea/mateu.xml`. Keyed by backend URL so pointing a project at another
 * backend never sends it the previous backend's token.
 */
object MateuCredentials {

    enum class Kind { TOKEN, REFRESH_TOKEN }

    fun attributes(kind: Kind, backend: String): CredentialAttributes =
        CredentialAttributes(generateServiceName("Mateu", "${kind.name.lowercase()}@${backend.trimEnd('/')}"))

    fun get(kind: Kind, backend: String): String? =
        PasswordSafe.instance.getPassword(attributes(kind, backend))?.ifBlank { null }

    fun set(kind: Kind, backend: String, secret: String?) {
        val creds = secret?.ifBlank { null }?.let { Credentials("mateu", it) }
        PasswordSafe.instance.set(attributes(kind, backend), creds)
    }

    fun clear(backend: String) = Kind.entries.forEach { set(it, backend, null) }
}
