package io.mateu.ijp.hub

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.RoamingType
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.State
import com.intellij.openapi.components.Storage
import java.security.SecureRandom

/**
 * "My UIs" — the desktop hub's list, the twin of the app's `src/hub/uiStore.ts`.
 *
 * Only METADATA lives here (base URL, name, icon, colour, the sign-in the manifest declared, timestamps):
 * what an export QR may show anyway. Tokens never do — the plugin keeps them in PasswordSafe, keyed by
 * base URL (MateuCredentials), so removing an entry clears them there.
 */
data class HubEntry(
    val id: String,
    val baseUrl: String,
    val name: String,
    val shortName: String? = null,
    val icon: String? = null,
    val themeColor: String? = null,
    val auth: HubManifest.Auth? = null,
    val addedAt: Long = 0,
    val lastOpened: Long? = null,
)

/** The list's rules, pure (unit-tested): one entry per base URL, stored entries re-validated, demo seeded once. */
class HubEntries(
    entries: List<HubEntry> = emptyList(),
    private val now: () -> Long = System::currentTimeMillis,
    private val newId: () -> String = ::randomId,
) {
    var entries: List<HubEntry> = sanitize(entries)
        private set

    fun get(id: String): HubEntry? = entries.find { it.id == id }

    fun findByBaseUrl(baseUrl: String): HubEntry? = entries.find { it.baseUrl == baseUrl }

    /** Adds (or returns the existing entry for) a base URL; `second` tells whether it was new. */
    fun add(baseUrl: String, manifest: HubManifest.Manifest? = null): Pair<HubEntry, Boolean> {
        findByBaseUrl(baseUrl)?.let { return it to false }
        val entry = make(baseUrl, manifest)
        entries = entries + entry
        return entry to true
    }

    /** Imports several base URLs (no manifest yet — fetched on first open). Returns how many were new. */
    fun importAll(baseUrls: List<String>): Int {
        var added = 0
        for (u in baseUrls) if (findByBaseUrl(u) == null) {
            entries = entries + make(u, null)
            added++
        }
        return added
    }

    /** The manifest fetched on open refreshes what the list shows (name, icon, colour, sign-in). */
    fun refresh(id: String, manifest: HubManifest.Manifest) = update(id) {
        it.copy(name = manifest.name, shortName = manifest.shortName, icon = manifest.icon, themeColor = manifest.themeColor, auth = manifest.auth)
    }

    fun touch(id: String) = update(id) { it.copy(lastOpened = now()) }

    fun rename(id: String, name: String) {
        val clean = HubLinks.jsTrim(name).take(HubManifest.MAX_NAME)
        if (clean.isNotEmpty()) update(id) { it.copy(name = clean) }
    }

    fun remove(id: String): HubEntry? = get(id)?.also { gone -> entries = entries.filter { it.id != gone.id } }

    /** Moves an entry one place up (-1) or down (+1); out of range does nothing. */
    fun move(id: String, delta: Int) {
        val i = entries.indexOfFirst { it.id == id }
        val j = i + delta
        if (i < 0 || j !in entries.indices) return
        entries = entries.toMutableList().apply { add(j, removeAt(i)) }
    }

    /** Case-insensitive search over name, short name and domain; every word must match. */
    fun search(query: String): List<HubEntry> {
        val words = query.lowercase().split(Regex("\\s+")).filter { it.isNotEmpty() }
        if (words.isEmpty()) return entries
        return entries.filter { e ->
            val hay = "${e.name} ${e.shortName.orEmpty()} ${HubLinks.domainOf(e.baseUrl)}".lowercase()
            words.all { hay.contains(it) }
        }
    }

    private fun update(id: String, change: (HubEntry) -> HubEntry) {
        entries = entries.map { if (it.id == id) change(it) else it }
    }

    private fun make(baseUrl: String, manifest: HubManifest.Manifest?) = HubEntry(
        id = newId(),
        baseUrl = baseUrl,
        name = manifest?.name ?: HubLinks.domainOf(baseUrl),
        shortName = manifest?.shortName,
        icon = manifest?.icon,
        themeColor = manifest?.themeColor,
        auth = manifest?.auth,
        addedAt = now(),
    )

    companion object {
        /** The "Try a demo" entry preinstalled on first launch. */
        const val DEMO_BASE_URL = "https://demo.mateu.io/counter"

        /** A stored entry is re-validated: the config file is not a trust boundary. */
        fun sanitize(raw: List<HubEntry>): List<HubEntry> {
            val seen = HashSet<String>()
            return raw.mapNotNull { e ->
                val n = HubLinks.normalizeBaseUrl(e.baseUrl, HubLinks.Options(allowInsecure = true)) as? HubLinks.BaseUrl.Ok ?: return@mapNotNull null
                if (e.id.isBlank() || !seen.add(n.baseUrl) || !seen.add("id:" + e.id)) return@mapNotNull null
                e.copy(baseUrl = n.baseUrl, name = e.name.ifBlank { HubLinks.domainOf(n.baseUrl) })
            }
        }

        private val random = SecureRandom()

        fun randomId(): String = "u" + ByteArray(9).also(random::nextBytes).joinToString("") { "%02x".format(it) }
    }
}

/** The persisted list (application level: one desktop app, one list). */
@Service(Service.Level.APP)
@State(name = "MateuHub", storages = [Storage(value = "mateu-hub.xml", roamingType = RoamingType.DISABLED)])
class HubStore : PersistentStateComponent<HubStore.StateBean> {

    /** XML-serializable shape (the platform serializer wants mutable beans with defaults). */
    class EntryBean {
        var id: String = ""
        var baseUrl: String = ""
        var name: String = ""
        var shortName: String? = null
        var icon: String? = null
        var themeColor: String? = null
        var authIssuer: String? = null
        var authClientId: String? = null
        var authScopes: String? = null
        var authAudience: String? = null
        var addedAt: Long = 0
        var lastOpened: Long = 0
    }

    class StateBean {
        var entries: MutableList<EntryBean> = mutableListOf()
        var seeded: Boolean = false
    }

    private var bean = StateBean()
    private val listeners = mutableListOf<() -> Unit>()

    /** The rules over the stored list; change it through [edit] so it is saved and listeners hear. */
    val list: HubEntries get() = HubEntries(bean.entries.map(::fromBean))

    override fun getState(): StateBean = bean

    override fun loadState(state: StateBean) {
        bean = state
    }

    /** First launch: the demo entry, once — removing it sticks. */
    fun seedOnce() {
        if (bean.seeded) return
        bean.seeded = true
        if (bean.entries.isEmpty()) edit { it.add(HubEntries.DEMO_BASE_URL, HubManifest.Manifest(name = "Try a demo", shortName = "Demo")) }
    }

    fun <T> edit(change: (HubEntries) -> T): T {
        val entries = list
        val result = change(entries)
        bean.entries = entries.entries.map(::toBean).toMutableList()
        listeners.toList().forEach { it() }
        return result
    }

    fun subscribe(listener: () -> Unit): () -> Unit {
        listeners += listener
        return { listeners -= listener }
    }

    companion object {
        fun getInstance(): HubStore = ApplicationManager.getApplication().getService(HubStore::class.java)

        internal fun toBean(e: HubEntry) = EntryBean().apply {
            id = e.id
            baseUrl = e.baseUrl
            name = e.name
            shortName = e.shortName
            icon = e.icon
            themeColor = e.themeColor
            authIssuer = e.auth?.issuer
            authClientId = e.auth?.clientId
            authScopes = e.auth?.scopes?.joinToString(" ")
            authAudience = e.auth?.audience
            addedAt = e.addedAt
            lastOpened = e.lastOpened ?: 0
        }

        internal fun fromBean(b: EntryBean) = HubEntry(
            id = b.id,
            baseUrl = b.baseUrl,
            name = b.name,
            shortName = b.shortName,
            icon = b.icon,
            themeColor = b.themeColor,
            auth = if (b.authIssuer != null && b.authClientId != null) {
                HubManifest.Auth(b.authIssuer!!, b.authClientId!!, b.authScopes?.split(' ')?.filter { it.isNotEmpty() } ?: HubManifest.DEFAULT_SCOPES, b.authAudience)
            } else {
                null
            },
            addedAt = b.addedAt,
            lastOpened = b.lastOpened.takeIf { it > 0 },
        )
    }
}
