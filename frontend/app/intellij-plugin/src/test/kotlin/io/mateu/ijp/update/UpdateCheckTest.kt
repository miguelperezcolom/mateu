package io.mateu.ijp.update

import com.sun.net.httpserver.HttpServer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.net.InetSocketAddress
import java.nio.file.Files
import java.nio.file.Path

class UpdateCheckTest {

    private val tmp: Path = Files.createTempDirectory("mateu-update-check")
    private val pluginsDir: Path = Files.createDirectories(tmp.resolve("plugins"))

    private fun settings(vararg sys: Pair<String, String?>, focused: Boolean = true): UpdaterSettings {
        val props = mapOf("mateu.desktop.platform" to "linux", "mateu.desktop.ideVersion" to "2025.2.6.3") + sys
        return resolveUpdaterSettings({ props[it] }, focused, pluginsDir)
    }

    /** A feed and a plugin zip served from memory; counts the downloads. */
    private inner class FakeTransport(private val feed: String, private val zip: Path? = null) : UpdateTransport {
        var downloads = 0
        override fun fetchText(url: String) = feed
        override fun download(url: String, target: Path) {
            downloads++
            Files.copy(zip!!, target, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
        }
    }

    private fun feed(version: String, sha: String = "a".repeat(64), ide: String = "2025.2.6.3") = """
        { "version": "$version",
          "plugin": { "url": "https://example.com/p.zip", "sha256": "$sha" },
          "platform": { "ideVersion": "$ide", "installers": { "linux": "https://example.com/l.tar.gz" } } }
    """

    // ── settings ────────────────────────────────────────────────────────────────────────────────

    @Test
    fun `only the desktop app updates itself`() {
        assertEquals("not the desktop app", settings(focused = false).disabledReason)
        // runIde -Dmateu.focused=true: focused but no baked platform
        assertEquals("not the desktop app", resolveUpdaterSettings({ null }, true, pluginsDir).disabledReason)
        val s = settings()
        assertTrue(s.enabled)
        assertEquals(UpdateFeed.DEFAULT_URL, s.feedUrl)
        assertEquals("linux", s.installerKey)
        assertEquals("2025.2.6.3", s.ideVersion)
        assertEquals(tmp.resolve("mateu-update").toAbsolutePath(), s.updateDir)
    }

    @Test
    fun `mateu updateUrl overrides the feed, and empty or none turns updates off`() {
        assertEquals("https://acme.example/feed.json", settings("mateu.updateUrl" to " https://acme.example/feed.json ").feedUrl)
        for (off in listOf("", "  ", "none", "OFF", "false")) {
            val s = settings("mateu.updateUrl" to off)
            assertNull(s.feedUrl)
            assertFalse(s.enabled)
        }
        assertTrue(settings("mateu.updateUrl" to "http://example.com/feed.json").disabledReason!!.contains("https"))
        assertEquals("no plugins directory", resolveUpdaterSettings({ mapOf("mateu.desktop.platform" to "linux")[it] }, true, null).disabledReason)
    }

    @Test
    fun `without a baked platform key the installer key comes from the JVM`() {
        val s = resolveUpdaterSettings({ mapOf("os.name" to "Mac OS X", "os.arch" to "aarch64")[it] }, true, pluginsDir)
        assertEquals("macos-aarch64", s.installerKey)
    }

    // ── the check ───────────────────────────────────────────────────────────────────────────────

    @Test
    fun `disabled settings answer Disabled without any network`() {
        val transport = FakeTransport("never read")
        val result = UpdateCheck(settings(focused = false), "1.0", transport).run()
        assertEquals(UpdateResult.Disabled("not the desktop app"), result)
    }

    @Test
    fun `the same or an older version is up to date`() {
        assertEquals(UpdateResult.UpToDate, UpdateCheck(settings(), "3.0-beta.27", FakeTransport(feed("3.0-beta.27"))).run())
        assertEquals(UpdateResult.UpToDate, UpdateCheck(settings(), "3.0-beta.28", FakeTransport(feed("3.0-beta.27"))).run())
    }

    @Test
    fun `a newer plugin is downloaded, verified and staged — once`() {
        val zip = pluginZip(tmp.resolve("p.zip"))
        val transport = FakeTransport(feed("3.0-beta.27", UpdateStaging.sha256(zip)), zip)
        assertEquals(UpdateResult.ReadyToRestart("3.0-beta.27"), UpdateCheck(settings(), "3.0-beta.26", transport).run())
        val staging = UpdateStaging(settings().updateDir!!)
        assertEquals("3.0-beta.27", staging.pendingVersion())
        assertFalse(Files.exists(staging.updateDir.resolve("download.zip.part")))
        // the next check finds it staged: no second download
        assertEquals(UpdateResult.ReadyToRestart("3.0-beta.27"), UpdateCheck(settings(), "3.0-beta.26", transport).run())
        assertEquals(1, transport.downloads)
    }

    @Test
    fun `a download that fails verification is reported and leaves nothing staged`() {
        val zip = pluginZip(tmp.resolve("p.zip"))
        val result = UpdateCheck(settings(), "3.0-beta.26", FakeTransport(feed("3.0-beta.27", "0".repeat(64)), zip)).run()
        assertTrue(result is UpdateResult.Failed && result.message.contains("sha256"))
        assertNull(UpdateStaging(settings().updateDir!!).pendingVersion())
    }

    @Test
    fun `another IntelliJ build means reinstalling, never patching`() {
        val result = UpdateCheck(settings(), "3.0-beta.26", FakeTransport(feed("3.0-beta.27", ide = "2026.1"))).run()
        assertEquals(UpdateResult.ReinstallNeeded("3.0-beta.27", "https://example.com/l.tar.gz", "2026.1"), result)
        // no installer for this machine in the feed: still reported, without a link
        val mac = settings("mateu.desktop.platform" to "macos-intel")
        val noLink = UpdateCheck(mac, "3.0-beta.26", FakeTransport(feed("3.0-beta.27", ide = "2026.1"))).run()
        assertEquals(UpdateResult.ReinstallNeeded("3.0-beta.27", null, "2026.1"), noLink)
    }

    @Test
    fun `a feed with no verifiable plugin, or an unreachable one, fails softly`() {
        val noPlugin = UpdateCheck(settings(), "1.0", FakeTransport("""{"version":"2.0"}""")).run()
        assertTrue(noPlugin is UpdateResult.Failed && noPlugin.message.contains("no verifiable plugin"))
        val broken = object : UpdateTransport {
            override fun fetchText(url: String): String = throw java.io.IOException("offline")
            override fun download(url: String, target: Path) = Unit
        }
        assertEquals(UpdateResult.Failed("offline"), UpdateCheck(settings(), "1.0", broken).run())
    }

    @Test
    fun `an older staged update is dropped before the check`() {
        val zip = pluginZip(tmp.resolve("old.zip"))
        val staging = UpdateStaging(settings().updateDir!!)
        staging.stage(zip, UpdateStaging.sha256(zip), "3.0-beta.20")
        UpdateCheck(settings(), "3.0-beta.26", FakeTransport(feed("3.0-beta.26"))).run()
        assertNull(staging.pendingVersion())
    }

    // ── the HTTP transport ──────────────────────────────────────────────────────────────────────

    @Test
    fun `the http transport follows redirects and refuses error statuses`() {
        val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/feed.json") { ex ->
            val body = """{"version":"9"}""".toByteArray()
            ex.sendResponseHeaders(200, body.size.toLong()); ex.responseBody.use { it.write(body) }
        }
        server.createContext("/latest") { ex ->
            ex.responseHeaders.add("Location", "/files/p.zip"); ex.sendResponseHeaders(302, -1); ex.close()
        }
        server.createContext("/files/p.zip") { ex ->
            val body = "zip-bytes".toByteArray()
            ex.sendResponseHeaders(200, body.size.toLong()); ex.responseBody.use { it.write(body) }
        }
        server.createContext("/missing") { ex -> ex.sendResponseHeaders(404, -1); ex.close() }
        server.start()
        try {
            val base = "http://127.0.0.1:${server.address.port}"
            val transport = HttpUpdateTransport()
            assertEquals("""{"version":"9"}""", transport.fetchText("$base/feed.json"))
            val target = tmp.resolve("dl/p.zip")
            transport.download("$base/latest", target)
            assertEquals("zip-bytes", Files.readString(target))
            assertTrue(runCatching { transport.fetchText("$base/missing") }.exceptionOrNull()!!.message!!.contains("404"))
            assertTrue(runCatching { transport.download("$base/missing", target) }.exceptionOrNull()!!.message!!.contains("404"))
        } finally {
            server.stop(0)
        }
    }
}
