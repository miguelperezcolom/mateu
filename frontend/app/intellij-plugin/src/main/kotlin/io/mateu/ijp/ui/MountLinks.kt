package io.mateu.ijp.ui

import io.mateu.ijp.api.Urls
import io.mateu.ijp.hub.HubManifest
import io.mateu.ijp.state.AppContext

/**
 * Where a link of a Mateu page goes on the desktop, which has no browser page to load it into.
 *
 * On the web `<a href="/x/behaviour/access-keys">` is a page load: whatever Mateu app is mounted at
 * that path answers with its own index. The desktop used to read every root-relative link as a route
 * of the CURRENT app (`ctx.navigate("/x/…")` against the Explorer, which answered with its own shell)
 * and every absolute one as a coloured label nobody could click. Now:
 *
 * - another origin (`https://mateu.io/…`, a static bundle on another port) → the system browser;
 * - a path → the app that owns it, found like the hub finds a page's app (its manifest, asked from
 *   the full path upwards): the current app → an in-app navigation to the rest of the path; another
 *   mount → that app, opened in its own view; no Mateu app there → the browser.
 */
object MountLinks {

    sealed interface Target {
        /** Nothing to follow. */
        data object None : Target
        /** Not a Mateu app the desktop can open: the system browser. */
        data class Browse(val url: String) : Target
        /** A route of the current app. */
        data class Navigate(val route: String) : Target
        /** Another Mateu app (mount) and the route inside it. */
        data class App(val baseUrl: String, val route: String) : Target
    }

    /** The target that needs no lookup, or null when the link's mount has to be resolved first. */
    fun immediate(hostBase: String, url: String): Target? {
        val u = url.trim()
        if (u.isEmpty() || u.startsWith("#")) return Target.None
        if (u.startsWith("mailto:", ignoreCase = true)) return Target.Browse(u)
        if (Urls.isAbsolute(u) && !u.startsWith("http", ignoreCase = true)) return Target.None
        val full = Urls.resolve(hostBase, u)
        val hostOrigin = Urls.origin(hostBase)
        // another origin is another site: the browser, as `target=_blank` does on the web
        if (hostOrigin == null || Urls.origin(full) != hostOrigin) return Target.Browse(full)
        return null
    }

    /** The target of a same-origin link once its mount is known ([mount] null = no Mateu app there). */
    fun fromMount(hostBase: String, url: String, mount: HubManifest.Mount?): Target {
        val full = Urls.resolve(hostBase, url)
        val fetched = mount?.fetched
        if (mount == null || fetched !is HubManifest.Fetch.Ok || fetched.missing) return Target.Browse(full)
        val route = mount.route.orEmpty().trim('/')
        return if (mount.baseUrl.trimEnd('/') == hostBase.trimEnd('/')) Target.Navigate("/$route")
        else Target.App(mount.baseUrl.trimEnd('/'), route)
    }

    /** Resolves [url] off the EDT and hands its [Target] back on it. */
    fun resolveInBackground(hostBase: String, url: String, onTarget: (Target) -> Unit) {
        immediate(hostBase, url)?.let { onTarget(it); return }
        Thread {
            val full = Urls.resolve(hostBase, url)
            val mount = runCatching { HubManifest.resolveMount(full, allowInsecure = true) }.getOrNull()
            val target = fromMount(hostBase, url, mount)
            javax.swing.SwingUtilities.invokeLater { onTarget(target) }
        }.apply { isDaemon = true; name = "mateu-link" }.start()
    }

    /** Follows a link of a page of [ctx]: in the app, in another app's view, or in the browser. */
    fun open(ctx: AppContext, url: String, label: String) {
        resolveInBackground(ctx.session.baseUrl, url) { target ->
            when (target) {
                Target.None -> Unit
                is Target.Browse -> SafeHtml.browse(target.url)
                is Target.Navigate -> ctx.navigate(target.route, "", null, "")
                is Target.App -> {
                    val opener = ctx.session.openRemoteViewHandler
                    if (opener != null) opener(label, target.route.ifBlank { "/" }, "", null, null, target.baseUrl)
                    else SafeHtml.browse(Urls.resolve(ctx.session.baseUrl, url))
                }
            }
        }
    }
}
