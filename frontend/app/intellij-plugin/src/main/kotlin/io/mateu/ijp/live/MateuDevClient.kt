package io.mateu.ijp.live

import java.net.HttpURLConnection
import java.net.URI

/**
 * The IDE's side of the dev endpoints a backend in development mode serves (`mateu.dev=true`):
 * `POST /mateu/dev/reload` re-renders the screen open in every browser — what the IDE fires after
 * a HotSwap, when the code changed but no spec did.
 */
object MateuDevClient {

    const val RELOAD_PATH = "/mateu/dev/reload"

    /** The reload URL for an app at [appUrl] (the endpoint lives at the server root). */
    fun reloadUrl(appUrl: String, scope: String? = null): String {
        val uri = URI(appUrl.trim())
        val origin = "${uri.scheme}://${uri.authority}"
        return origin + RELOAD_PATH + if (scope.isNullOrBlank()) "" else "?scope=$scope"
    }

    /** Fires the reload; true when the backend took it (204). Never throws. */
    fun reload(appUrl: String, scope: String? = null): Boolean = runCatching {
        val connection = URI(reloadUrl(appUrl, scope)).toURL().openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.connectTimeout = 2000
        connection.readTimeout = 2000
        connection.doOutput = true
        connection.outputStream.use { }
        val status = connection.responseCode
        connection.disconnect()
        status in 200..299
    }.getOrDefault(false)

    /** Whether something answers HTTP at [url] yet. */
    fun answers(url: String): Boolean = runCatching {
        val connection = URI(url).toURL().openConnection() as HttpURLConnection
        connection.connectTimeout = 1000
        connection.readTimeout = 3000
        val status = connection.responseCode
        connection.disconnect()
        status > 0
    }.getOrDefault(false)
}
