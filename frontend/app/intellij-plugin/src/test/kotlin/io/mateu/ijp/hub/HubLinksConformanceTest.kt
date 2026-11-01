package io.mateu.ijp.hub

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The hub link corpus (conformance/client/hub-links.json), generated from the React Native app's
 * parser: the desktop hub accepts, refuses and words its reasons exactly like the phone.
 */
class HubLinksConformanceTest {

    private val mapper = ObjectMapper()

    private fun corpus(): JsonNode {
        var dir: File? = File("").absoluteFile
        while (dir != null) {
            val f = File(dir, "conformance/client/hub-links.json")
            if (f.exists()) return mapper.readTree(f)
            dir = dir.parentFile
        }
        error("conformance/client/hub-links.json not found above ${File("").absolutePath}")
    }

    private fun options(case: JsonNode) = case.get("options")?.let { o ->
        HubLinks.Options(
            allowInsecure = o.path("allowInsecure").asBoolean(false),
            allowLoopbackHttp = o.path("allowLoopbackHttp").asBoolean(false),
            extraLinkHosts = o.path("extraLinkHosts").map { it.asText() },
        )
    } ?: HubLinks.Options()

    private fun json(value: Any?): JsonNode = mapper.valueToTree(value)

    private fun baseUrlJson(r: HubLinks.BaseUrl): JsonNode = when (r) {
        is HubLinks.BaseUrl.Ok -> json(mapOf("ok" to true, "baseUrl" to r.baseUrl, "host" to r.host, "secure" to r.secure))
        is HubLinks.BaseUrl.Refused -> json(mapOf("ok" to false, "reason" to r.reason))
    }

    private fun linkJson(r: HubLinks.Link): JsonNode = when (r) {
        is HubLinks.Link.Add -> json(listOfNotNull("kind" to "add", "baseUrl" to r.baseUrl, r.route?.let { "route" to it }).toMap())
        is HubLinks.Link.Import -> json(mapOf("kind" to "import", "baseUrls" to r.baseUrls, "rejected" to r.rejected))
        is HubLinks.Link.Invalid -> json(mapOf("kind" to "invalid", "reason" to r.reason))
    }

    @Test
    fun `addresses, routes and links are read exactly like the phone reads them`() {
        val corpus = corpus()
        val failures = mutableListOf<String>()
        fun check(section: String, case: JsonNode, actual: JsonNode) {
            if (actual != case.get("result")) failures += "$section ${case.get("input")}: expected ${case.get("result")}, got $actual"
        }
        corpus.get("addresses").forEach { check("address", it, baseUrlJson(HubLinks.normalizeBaseUrl(it.get("input").asText(), options(it)))) }
        corpus.get("routes").forEach {
            val input = it.get("input").takeUnless { n -> n.isNull }?.asText()
            check("route", it, json(HubLinks.sanitizeRoute(input)))
        }
        corpus.get("links").forEach { check("link", it, linkJson(HubLinks.parse(it.get("input").asText(), options(it)))) }
        corpus.get("addLinks").forEach {
            val route = it.get("route").takeUnless { n -> n.isNull }?.asText()
            check("addLink", it, json(HubLinks.addLink(it.get("baseUrl").asText(), route)))
        }
        assertTrue(failures.joinToString("\n", "${failures.size} hub link cases failed:\n"), failures.isEmpty())
    }

    @Test
    fun `the export forms round-trip through the parser`() {
        val urls = listOf("https://acme.com/crm", "https://demo.mateu.io/counter")
        assertEquals(HubLinks.Link.Import(urls, 0), HubLinks.parse(HubLinks.exportLink(urls)))
        assertEquals(HubLinks.Link.Import(urls, 0), HubLinks.parse("mateu://import?d=${HubLinks.encodeImportPayload(urls)}"))
        for (s in listOf("", "a", "ab", "abc", "héllo € 😀")) assertEquals(s, HubLinks.base64UrlDecode(HubLinks.base64UrlEncode(s)))
        assertEquals("acme.com:8443", HubLinks.domainOf("https://acme.com:8443/crm"))
        assertEquals("nope", HubLinks.domainOf("nope"))
    }

    @Test
    fun `malformed escapes and js whitespace`() {
        assertEquals(HubLinks.Link.Invalid("The link is damaged."), HubLinks.parse("mateu://add?u=%zz"))
        assertEquals(HubLinks.Link.Invalid("The link is damaged."), HubLinks.parse("mateu://add?u=%E2%82"))
        assertEquals(HubLinks.Link.Add("https://acme.com"), HubLinks.parse("﻿ mateu://add?u=acme.com　"))
        assertEquals(listOf("a" to "b c", "k" to ""), HubLinks.parseQuery("?a=b+c&&k"))
        assertEquals(null, HubLinks.base64UrlDecode("/+"))
        assertEquals(HubLinks.BaseUrl.Refused("Not an address."), HubLinks.normalizeBaseUrl(null))
        assertEquals(HubLinks.Link.Invalid("The code is empty."), HubLinks.parse(null))
    }
}
