package io.mateu.ijp.update

import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import java.security.MessageDigest
import java.util.zip.ZipInputStream

/**
 * The staging area of a plugin update, next to the custom plugins dir:
 *
 *   <update dir>/pending/READY                      ← present only when the rest is complete
 *   <update dir>/pending/version.txt
 *   <update dir>/pending/mateu-intellij-plugin/…    ← the unzipped plugin, ready to drop in
 *
 * The running plugin is NEVER touched: the launchers (`installer/apply-update.sh` / `.cmd`, run
 * before the IDE starts) swap `pending/mateu-intellij-plugin` into the plugins dir. The pending dir is
 * built under `pending.tmp` and RENAMED into place with READY already inside, so a launcher sees a
 * whole update or none — a crash mid-download leaves only `pending.tmp`, cleaned up by the next stage.
 */
class UpdateStaging(
    val updateDir: Path,
    val pluginDirName: String = PLUGIN_DIR_NAME,
) {
    val pending: Path = updateDir.resolve("pending")

    /** The version of a complete staged update, or null. */
    fun pendingVersion(): String? {
        if (!Files.isRegularFile(pending.resolve(READY)) || !Files.isDirectory(pending.resolve(pluginDirName))) return null
        return runCatching { Files.readString(pending.resolve(VERSION)).trim() }.getOrNull()?.ifBlank { null }
    }

    /** Verifies [zip] against [expectedSha256], unpacks it and stages it as [version]. Throws (and
     *  stages nothing) when the digest differs or the archive is not a plugin. */
    fun stage(zip: Path, expectedSha256: String, version: String) {
        val actual = sha256(zip)
        if (!actual.equals(expectedSha256, ignoreCase = true)) {
            throw UpdateVerificationException("the downloaded plugin does not match its sha256 (expected $expectedSha256, got $actual)")
        }
        Files.createDirectories(updateDir)
        val tmp = updateDir.resolve("pending.tmp")
        deleteRecursively(tmp)
        val unpacked = tmp.resolve("unpacked")
        unzip(zip, unpacked)
        val root = pluginRoot(unpacked)
            ?: throw UpdateVerificationException("the downloaded archive is not a plugin (no lib/*.jar)")
        Files.move(root, tmp.resolve(pluginDirName))
        deleteRecursively(unpacked)
        Files.writeString(tmp.resolve(VERSION), version)
        Files.writeString(tmp.resolve(READY), "")
        deleteRecursively(pending)
        Files.move(tmp, pending, StandardCopyOption.ATOMIC_MOVE)
    }

    /** Drops a staged update that is not newer than [installedVersion] (the app was reinstalled, or it
     *  was applied and its marker survived), so a launcher never swaps an OLDER plugin in. */
    fun discardIfNotNewer(installedVersion: String) {
        val staged = pendingVersion()
        // no complete update (a torn one included) or one the installed plugin already reached
        if (staged == null || compareDesktopVersions(staged, installedVersion) <= 0) deleteRecursively(pending)
        deleteRecursively(updateDir.resolve("pending.tmp"))
    }

    companion object {
        const val PLUGIN_DIR_NAME = "mateu-intellij-plugin"
        const val READY = "READY"
        const val VERSION = "version.txt"

        fun sha256(file: Path): String {
            val digest = MessageDigest.getInstance("SHA-256")
            Files.newInputStream(file).use { input ->
                val buffer = ByteArray(64 * 1024)
                while (true) {
                    val n = input.read(buffer)
                    if (n < 0) break
                    digest.update(buffer, 0, n)
                }
            }
            return digest.digest().joinToString("") { "%02x".format(it) }
        }

        /** The plugin inside an unpacked archive: the archive root itself or its single top-level
         *  directory (the Marketplace layout `mateu-intellij-plugin/lib/<jars>`) — whichever has jars in lib/. */
        internal fun pluginRoot(unpacked: Path): Path? {
            fun hasJars(dir: Path): Boolean {
                val lib = dir.resolve("lib")
                if (!Files.isDirectory(lib)) return false
                return Files.list(lib).use { s -> s.anyMatch { it.fileName.toString().endsWith(".jar") } }
            }
            if (hasJars(unpacked)) return unpacked
            val children = Files.list(unpacked).use { s -> s.filter(Files::isDirectory).toList() }
            return children.singleOrNull()?.takeIf(::hasJars)
        }

        internal fun unzip(zip: Path, target: Path) {
            Files.createDirectories(target)
            val root = target.toAbsolutePath().normalize()
            ZipInputStream(Files.newInputStream(zip)).use { input ->
                while (true) {
                    val entry = input.nextEntry ?: break
                    val out = root.resolve(entry.name).normalize()
                    // zip-slip: an entry may never land outside the target
                    if (!out.startsWith(root)) throw UpdateVerificationException("unsafe entry in the archive: ${entry.name}")
                    if (entry.isDirectory) {
                        Files.createDirectories(out)
                    } else {
                        Files.createDirectories(out.parent)
                        Files.copy(input, out, StandardCopyOption.REPLACE_EXISTING)
                    }
                }
            }
        }

        internal fun deleteRecursively(path: Path) {
            if (!Files.exists(path)) return
            path.toFile().deleteRecursively()
        }
    }
}

/** The download is not what the feed promised (digest, archive shape): nothing was staged. */
class UpdateVerificationException(message: String) : IOException(message)
