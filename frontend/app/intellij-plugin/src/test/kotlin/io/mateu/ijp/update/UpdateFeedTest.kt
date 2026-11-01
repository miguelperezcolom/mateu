package io.mateu.ijp.update

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class UpdateFeedTest {

    private val sha = "a".repeat(64)

    @Test
    fun `a full feed parses`() {
        val feed = UpdateFeed.parse(
            """
            { "version": "3.0-beta.27",
              "plugin": { "url": "https://example.com/p.zip", "sha256": "${sha.uppercase()}" },
              "platform": { "ideVersion": "2025.2.6.3",
                "installers": { "macos-aarch64": "https://example.com/a.dmg", "linux": "https://example.com/l.tar.gz" } },
              "notes": "Bug fixes" }
            """,
        )
        assertEquals("3.0-beta.27", feed.version)
        assertEquals(UpdateFeed.PluginRelease("https://example.com/p.zip", sha), feed.plugin)
        assertEquals("2025.2.6.3", feed.ideVersion)
        assertEquals(mapOf("macos-aarch64" to "https://example.com/a.dmg", "linux" to "https://example.com/l.tar.gz"), feed.installers)
        assertEquals("Bug fixes", feed.notes)
    }

    @Test
    fun `a plugin entry that cannot be verified is dropped, not trusted`() {
        // plain http, a short digest, no digest at all
        assertNull(UpdateFeed.parse("""{"version":"1","plugin":{"url":"http://example.com/p.zip","sha256":"$sha"}}""").plugin)
        assertNull(UpdateFeed.parse("""{"version":"1","plugin":{"url":"https://example.com/p.zip","sha256":"abc"}}""").plugin)
        assertNull(UpdateFeed.parse("""{"version":"1","plugin":{"url":"https://example.com/p.zip"}}""").plugin)
        // an http installer link is dropped too; the rest stay
        val feed = UpdateFeed.parse("""{"version":"1","platform":{"installers":{"linux":"http://x/l","windows":"https://x/w"}}}""")
        assertEquals(mapOf("windows" to "https://x/w"), feed.installers)
        assertNull(feed.ideVersion)
        assertNull(feed.notes)
    }

    @Test(expected = IllegalArgumentException::class)
    fun `a document without a version is not a feed`() {
        UpdateFeed.parse("""{"plugin":{}}""")
    }

    @Test
    fun `loopback http is allowed for a local feed, nothing else is`() {
        assertTrue(UpdateFeed.isAllowedUrl("http://localhost:8080/feed.json"))
        assertTrue(UpdateFeed.isAllowedUrl("http://127.0.0.1/feed.json"))
        assertTrue(UpdateFeed.isAllowedUrl("HTTPS://example.com/feed.json"))
        assertEquals(false, UpdateFeed.isAllowedUrl("http://localhost.evil.com/feed.json"))
        assertEquals(false, UpdateFeed.isAllowedUrl("file:///etc/passwd"))
    }

    @Test
    fun `versions order alpha before beta before rc before GA, numbers numerically`() {
        val ordered = listOf(
            "3.0-SNAPSHOT", "3.0-alpha.9", "3.0-alpha.412", "3.0-beta.1", "3.0-beta.9", "3.0-beta.26",
            "3.0-rc.1", "3.0-rc.2", "3.0", "3.0.1", "3.1-beta.1", "3.1.0", "10.0.0",
        )
        for (i in ordered.indices) for (j in ordered.indices) {
            val expected = i.compareTo(j)
            val actual = Integer.signum(compareDesktopVersions(ordered[i], ordered[j]))
            assertEquals("${ordered[i]} vs ${ordered[j]}", expected, actual)
        }
        assertEquals(0, compareDesktopVersions("3.0", "3.0.0"))
        assertEquals(0, compareDesktopVersions("v3.0-beta.26", "3.0-beta.26"))
        assertTrue(compareDesktopVersions("3.0-beta26", "3.0-beta.25") > 0)
        assertTrue(compareDesktopVersions("0.1.1", "3.0-beta.27") < 0)
    }

    @Test
    fun `the installer key follows the os and arch`() {
        assertEquals("macos-aarch64", installerKey("Mac OS X", "aarch64"))
        assertEquals("macos-aarch64", installerKey("Darwin", "arm64"))
        assertEquals("macos-intel", installerKey("Mac OS X", "x86_64"))
        assertEquals("windows", installerKey("Windows 11", "amd64"))
        assertEquals("linux", installerKey("Linux", "amd64"))
    }
}
