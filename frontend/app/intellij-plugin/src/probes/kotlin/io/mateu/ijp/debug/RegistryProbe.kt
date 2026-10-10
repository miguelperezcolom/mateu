package io.mateu.ijp.debug

import com.fasterxml.jackson.databind.ObjectMapper
import com.sun.net.httpserver.HttpServer
import io.mateu.ijp.plugin.AppRegistry
import java.net.InetSocketAddress
import kotlin.system.exitProcess

/**
 * Dev-only: exercises the app-registry client headlessly (no IDE) — entry URL resolution,
 * fetch + parse against a throwaway local HTTP registry, and the version comparator.
 * Run with: ./gradlew -q registryProbe
 */
fun main() {
    var failures = 0
    fun check(name: String, ok: Boolean, detail: String = "") {
        println("${if (ok) "PASS" else "FAIL"}  $name${if (detail.isNotEmpty()) " — $detail" else ""}")
        if (!ok) failures++
    }

    // entry URL resolution
    check(
        "static-hosting entry url",
        AppRegistry.entryUrl("https://reg.example.com/", "demo") == "https://reg.example.com/demo.json",
    )
    check(
        "placeholder entry url",
        AppRegistry.entryUrl("https://api.example.com/apps/{appId}", "demo") == "https://api.example.com/apps/demo",
    )

    // version comparator
    check("equal versions", AppRegistry.compareVersions("1.2.0", "1.2") == 0)
    check("older < newer", AppRegistry.compareVersions("0.1.0", "0.2.0") < 0)
    check("ide builds compare numerically", AppRegistry.compareVersions("243.22562.145", "243.0") > 0)
    check("non-numeric suffixes ignored", AppRegistry.compareVersions("242.21829-EAP", "243.0") < 0)

    // fetch + parse against a local registry
    val entryJson = """
        {
          "appId": "demo",
          "baseUrl": "http://localhost:8592/",
          "parameters": { "tenantId": "1111" },
          "intellij": { "requiredPluginVersion": "0.2.0", "requiredIdeBuild": "243.0",
                        "downloadUrl": "https://plugins.example.com/mateu.zip" }
        }
    """.trimIndent()
    val server = HttpServer.create(InetSocketAddress(0), 0)
    server.createContext("/demo.json") { exchange ->
        val bytes = entryJson.toByteArray()
        exchange.responseHeaders.add("Content-Type", "application/json")
        exchange.sendResponseHeaders(200, bytes.size.toLong())
        exchange.responseBody.use { it.write(bytes) }
    }
    server.start()
    try {
        val entry = AppRegistry.fetch("http://localhost:${server.address.port}", "demo", ObjectMapper())
        check("baseUrl parsed (trailing slash trimmed)", entry.baseUrl == "http://localhost:8592")
        check("parameters parsed", entry.parameters["tenantId"] == "1111")
        check("plugin requirement parsed", entry.requiredPluginVersion == "0.2.0")
        check("ide requirement parsed", entry.requiredIdeBuild == "243.0")
        check("download url parsed", entry.downloadUrl == "https://plugins.example.com/mateu.zip")
        // outside a running IDE the installed plugin version is 0.0.0 → the requirement blocks,
        // and the IDE build is unknown → the IDE requirement is skipped
        val block = AppRegistry.versionBlock(entry)
        check("version gate blocks when plugin too old", block != null && block.message.contains("0.2.0"))
        check("block carries the download url", block?.downloadUrl == "https://plugins.example.com/mateu.zip")
        val open = AppRegistry.versionBlock(entry.copy(requiredPluginVersion = null, requiredIdeBuild = null))
        check("no requirements → no block", open == null)
    } finally {
        server.stop(0)
    }

    println(if (failures == 0) "\nALL CHECKS PASSED" else "\n$failures CHECKS FAILED")
    exitProcess(if (failures == 0) 0 else 1)
}
