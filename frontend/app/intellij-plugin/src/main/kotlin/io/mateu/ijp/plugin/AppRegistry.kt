package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.ide.plugins.PluginManagerCore
import com.intellij.openapi.application.ApplicationInfo
import com.intellij.openapi.extensions.PluginId
import java.net.URI
import java.net.URLEncoder
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.charset.StandardCharsets
import java.time.Duration

/**
 * App registry client — the same renderer-agnostic contract the React Native renderer boots
 * through: the installable carries only a registry URL + app id, and the registry entry maps the
 * app id to the Mateu base URL, the launch parameters (seeded into appState) and the required
 * renderer versions. For this renderer the relevant block is `intellij`:
 *
 *   {
 *     "baseUrl": "https://apps.example.com/admin",
 *     "parameters": { "tenantId": "1111" },
 *     "intellij": {
 *       "requiredPluginVersion": "0.2.0",
 *       "requiredIdeBuild": "243.0",
 *       "downloadUrl": "https://plugins.example.com/mateu-latest.zip"
 *     }
 *   }
 *
 * The entry URL is `{registryUrl}/{appId}.json`, or the registry URL itself with an `{appId}`
 * placeholder substituted.
 */
object AppRegistry {

    const val PLUGIN_ID = "io.mateu.ijp.plugin"

    data class Entry(
        val baseUrl: String,
        val parameters: Map<String, Any?>,
        val requiredPluginVersion: String?,
        val requiredIdeBuild: String?,
        val downloadUrl: String?,
    )

    /** A version requirement the installed plugin/IDE does not meet; null when boot may proceed. */
    data class Block(val message: String, val downloadUrl: String?)

    fun entryUrl(registryUrl: String, appId: String): String {
        val encoded = URLEncoder.encode(appId, StandardCharsets.UTF_8)
        if (registryUrl.contains("{appId}")) return registryUrl.replace("{appId}", encoded)
        return registryUrl.trimEnd('/') + "/" + encoded + ".json"
    }

    fun fetch(registryUrl: String, appId: String, mapper: ObjectMapper): Entry {
        val url = entryUrl(registryUrl, appId)
        val client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build()
        val request = HttpRequest.newBuilder(URI.create(url))
            .header("Accept", "application/json")
            .timeout(Duration.ofSeconds(15))
            .GET()
            .build()
        val response = client.send(request, HttpResponse.BodyHandlers.ofString())
        if (response.statusCode() !in 200..299) {
            throw IllegalStateException("Registry answered HTTP ${response.statusCode()} for $url")
        }
        val node = mapper.readTree(response.body())
        val baseUrl = node.path("baseUrl").asText("")
        if (baseUrl.isBlank()) throw IllegalStateException("Registry entry for '$appId' has no baseUrl")
        val intellij = node.path("intellij")
        return Entry(
            baseUrl = baseUrl.trimEnd('/'),
            parameters = node.path("parameters").toMap(mapper),
            requiredPluginVersion = intellij.path("requiredPluginVersion").textOrNull(),
            requiredIdeBuild = intellij.path("requiredIdeBuild").textOrNull(),
            downloadUrl = intellij.path("downloadUrl").textOrNull(),
        )
    }

    /** Numeric dotted-version compare; missing/non-numeric segments count as 0 ("1.2" == "1.2.0"). */
    fun compareVersions(a: String, b: String): Int {
        val pa = a.split('.')
        val pb = b.split('.')
        for (i in 0 until maxOf(pa.size, pb.size)) {
            val na = pa.getOrNull(i)?.takeWhile { it.isDigit() }?.toIntOrNull() ?: 0
            val nb = pb.getOrNull(i)?.takeWhile { it.isDigit() }?.toIntOrNull() ?: 0
            if (na != nb) return na - nb
        }
        return 0
    }

    fun installedPluginVersion(): String =
        runCatching { PluginManagerCore.getPlugin(PluginId.getId(PLUGIN_ID))?.version }
            .getOrNull() ?: "0.0.0"

    /** The IDE build ("243.22562.145"); null outside a running IDE (renderProbe). */
    fun installedIdeBuild(): String? =
        runCatching { ApplicationInfo.getInstance().build.asStringWithoutProductCode() }.getOrNull()

    /** Checks the entry's version requirements against the installed plugin and IDE. */
    fun versionBlock(entry: Entry): Block? {
        val requiredPlugin = entry.requiredPluginVersion
        if (requiredPlugin != null && compareVersions(installedPluginVersion(), requiredPlugin) < 0) {
            return Block(
                "This app needs Mateu plugin $requiredPlugin — you have ${installedPluginVersion()}.",
                entry.downloadUrl,
            )
        }
        val requiredIde = entry.requiredIdeBuild
        val ide = installedIdeBuild()
        if (requiredIde != null && ide != null && compareVersions(ide, requiredIde) < 0) {
            return Block(
                "This app needs IntelliJ build $requiredIde or newer — you are on $ide.",
                null,
            )
        }
        return null
    }

    private fun JsonNode.textOrNull(): String? = if (isMissingNode || isNull) null else asText().ifBlank { null }

    private fun JsonNode.toMap(mapper: ObjectMapper): Map<String, Any?> =
        if (isObject) {
            @Suppress("UNCHECKED_CAST")
            mapper.convertValue(this, Map::class.java) as Map<String, Any?>
        } else {
            emptyMap()
        }
}
