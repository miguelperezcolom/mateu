package io.mateu.ijp.update

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test
import java.nio.file.Files
import java.nio.file.Path
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/** Builds a zip of [entries] (name → content; a name ending in / is a directory). */
internal fun zipOf(target: Path, entries: Map<String, String>): Path {
    ZipOutputStream(Files.newOutputStream(target)).use { zip ->
        for ((name, content) in entries) {
            zip.putNextEntry(ZipEntry(name))
            if (!name.endsWith("/")) zip.write(content.toByteArray())
            zip.closeEntry()
        }
    }
    return target
}

/** A plugin zip in the Marketplace layout `buildPlugin` produces. */
internal fun pluginZip(target: Path, marker: String = "new"): Path = zipOf(
    target,
    mapOf(
        "mateu-intellij-plugin/" to "",
        "mateu-intellij-plugin/lib/" to "",
        "mateu-intellij-plugin/lib/mateu-intellij-plugin.jar" to marker,
    ),
)

class UpdateStagingTest {

    private val tmp: Path = Files.createTempDirectory("mateu-staging")
    private val staging = UpdateStaging(tmp.resolve("mateu-update"))

    @Test
    fun `a verified plugin is staged whole, with READY and its version`() {
        val zip = pluginZip(tmp.resolve("p.zip"))
        staging.stage(zip, UpdateStaging.sha256(zip), "3.0-beta.27")
        assertEquals("3.0-beta.27", staging.pendingVersion())
        val jar = staging.pending.resolve("mateu-intellij-plugin/lib/mateu-intellij-plugin.jar")
        assertEquals("new", Files.readString(jar))
        assertTrue(Files.exists(staging.pending.resolve("READY")))
        assertFalse(Files.exists(staging.updateDir.resolve("pending.tmp")))
    }

    @Test
    fun `a flat archive (lib at the root) is a plugin too, and a newer stage replaces the old one`() {
        val first = pluginZip(tmp.resolve("p1.zip"), "one")
        staging.stage(first, UpdateStaging.sha256(first), "3.0-beta.27")
        val flat = zipOf(tmp.resolve("flat.zip"), mapOf("lib/x.jar" to "two"))
        staging.stage(flat, UpdateStaging.sha256(flat), "3.0-beta.28")
        assertEquals("3.0-beta.28", staging.pendingVersion())
        assertEquals("two", Files.readString(staging.pending.resolve("mateu-intellij-plugin/lib/x.jar")))
    }

    @Test
    fun `a download that does not match its digest stages nothing`() {
        val zip = pluginZip(tmp.resolve("p.zip"))
        try {
            staging.stage(zip, "0".repeat(64), "3.0-beta.27")
            fail("expected a verification failure")
        } catch (e: UpdateVerificationException) {
            assertTrue(e.message!!.contains("sha256"))
        }
        assertNull(staging.pendingVersion())
    }

    @Test
    fun `an archive that is not a plugin stages nothing`() {
        val zip = zipOf(tmp.resolve("x.zip"), mapOf("README.txt" to "hi"))
        try {
            staging.stage(zip, UpdateStaging.sha256(zip), "1.0")
            fail("expected a verification failure")
        } catch (e: UpdateVerificationException) {
            assertTrue(e.message!!.contains("not a plugin"))
        }
        assertNull(staging.pendingVersion())
    }

    @Test
    fun `an entry escaping the target is refused (zip slip)`() {
        val zip = zipOf(tmp.resolve("evil.zip"), mapOf("../../evil.txt" to "x"))
        try {
            staging.stage(zip, UpdateStaging.sha256(zip), "1.0")
            fail("expected a verification failure")
        } catch (e: UpdateVerificationException) {
            assertTrue(e.message!!.contains("unsafe"))
        }
        assertFalse(Files.exists(tmp.resolve("evil.txt")))
    }

    @Test
    fun `a staged update that is not newer than the installed plugin is discarded`() {
        val zip = pluginZip(tmp.resolve("p.zip"))
        staging.stage(zip, UpdateStaging.sha256(zip), "3.0-beta.27")
        staging.discardIfNotNewer("3.0-beta.26")
        assertEquals("3.0-beta.27", staging.pendingVersion())
        staging.discardIfNotNewer("3.0-beta.27")
        assertNull(staging.pendingVersion())
        assertFalse(Files.exists(staging.pending))
    }

    @Test
    fun `a torn pending dir (no READY) counts as nothing and is cleaned up`() {
        Files.createDirectories(staging.pending.resolve("mateu-intellij-plugin/lib"))
        Files.writeString(staging.pending.resolve("version.txt"), "9.9.9")
        assertNull(staging.pendingVersion())
        staging.discardIfNotNewer("1.0")
        assertFalse(Files.exists(staging.pending))
    }

    @Test
    fun `sha256 is the lowercase hex digest`() {
        val f = Files.writeString(tmp.resolve("abc.txt"), "abc")
        assertEquals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", UpdateStaging.sha256(f))
    }
}
