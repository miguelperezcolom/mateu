package io.mateu.ijp.hub

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.live.QrPanel
import io.mateu.ijp.plugin.resolveMateuConfig
import java.awt.image.BufferedImage
import java.io.File
import java.util.Properties
import javax.imageio.ImageIO
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class HubTest {

    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    /** A fake server: path → (status, body); anything else is unreachable. */
    private fun server(vararg answers: Pair<String, Pair<Int, String>>): HubManifest.Get {
        val map = answers.toMap()
        return HubManifest.Get { url -> map[url] ?: throw java.io.IOException("unreachable $url") }
    }

    // ── the manifest ──────────────────────────────────────────────────────────────────────────

    @Test
    fun `a manifest is validated field by field`() {
        val m = HubManifest.parse(
            json(
                """{"name":"  Acme\u202e CRM  ","shortName":"A very long short name indeed","icon":"/icon.png","themeColor":"#ABC",
                   "wireVersion":3,"auth":{"issuer":"https://id.acme.com/realms/x/","clientId":"crm","scopes":"openid profile"},"bundle":""}""",
            ),
            "https://acme.com/crm",
        )
        assertEquals("Acme CRM", m.name)
        assertEquals("A very long short na", m.shortName)
        assertEquals("https://acme.com/icon.png", m.icon)
        assertEquals("#abc", m.themeColor)
        assertEquals("3", m.wireVersion)
        assertEquals(HubManifest.Auth("https://id.acme.com/realms/x", "crm", listOf("openid", "profile")), m.auth)
        assertNull(m.bundle)
    }

    @Test
    fun `odd manifest values are dropped, never shown`() {
        val m = HubManifest.parse(json("""{"icon":"javascript:alert(1)","themeColor":"red","auth":{"issuer":"http://id","clientId":"x"}}"""), "https://acme.com")
        assertEquals("acme.com", m.name)
        assertNull(m.icon)
        assertNull(m.themeColor)
        assertNull(m.auth) // a password must not travel over http
        assertEquals("https://acme.com/crm/i.png", HubManifest.resolveIcon(json("\"i.png\""), "https://acme.com/crm/"))
        assertNull(HubManifest.resolveIcon(json("\"//evil.com/i.png\""), "https://acme.com"))
        assertNull(HubManifest.resolveIcon(json("\"data:image/svg+xml;base64,AAAA\""), "https://acme.com"))
        assertEquals("data:image/png;base64,AAAA", HubManifest.resolveIcon(json("\"data:image/png;base64,AAAA\""), "https://acme.com"))
        assertNull(HubManifest.parse(json("""{"auth":{"type":"saml","issuer":"https://id","clientId":"x"}}"""), "https://a.io").auth)
        assertEquals(HubManifest.DEFAULT_SCOPES, HubManifest.parse(json("""{"auth":{"issuer":"https://id","clientId":"x","scopes":[]}}"""), "https://a.io").auth?.scopes)
        assertEquals("a.io", HubManifest.parse(json("[1]"), "https://a.io").name)
    }

    @Test
    fun `static UIs and other wire majors are refused on the desktop`() {
        assertTrue(HubManifest.refusal(HubManifest.Manifest("x", bundle = "manifest.json"))!!.contains("static UI"))
        assertTrue(HubManifest.refusal(HubManifest.Manifest("x", wireVersion = "4.0"), supportedMajor = 3)!!.contains("newer Mateu"))
        assertTrue(HubManifest.refusal(HubManifest.Manifest("x", wireVersion = "2"), supportedMajor = 3)!!.contains("too old"))
        assertNull(HubManifest.refusal(HubManifest.Manifest("x", wireVersion = "3.1"), supportedMajor = 3))
        assertNull(HubManifest.refusal(HubManifest.Manifest("x")))
    }

    @Test
    fun `fetching tells an older Mateu, an error and no network apart`() {
        val http = server(
            "https://old.io/mateu/v3/manifest" to (404 to ""),
            "https://bad.io/mateu/v3/manifest" to (500 to ""),
            "https://html.io/mateu/v3/manifest" to (200 to "<html>"),
            "https://ok.io/mateu/v3/manifest" to (200 to """{"name":"Ok"}"""),
        )
        assertEquals(HubManifest.Fetch.Ok(HubManifest.Manifest("old.io"), missing = true), HubManifest.fetch("https://old.io", http))
        assertTrue((HubManifest.fetch("https://bad.io", http) as HubManifest.Fetch.Failed).reason.contains("HTTP 500"))
        assertTrue((HubManifest.fetch("https://html.io", http) as HubManifest.Fetch.Failed).reason.contains("not JSON"))
        assertTrue((HubManifest.fetch("https://down.io", http) as HubManifest.Fetch.Failed).offline)
        assertEquals("Ok", (HubManifest.fetch("https://ok.io", http) as HubManifest.Fetch.Ok).manifest.name)
    }

    @Test
    fun `a page address finds its mount from the full path upwards`() {
        val http = server(
            "https://acme.com/crm/orders/7/mateu/v3/manifest" to (404 to ""),
            "https://acme.com/crm/orders/mateu/v3/manifest" to (404 to ""),
            "https://acme.com/crm/mateu/v3/manifest" to (200 to """{"name":"CRM"}"""),
        )
        val mount = HubManifest.resolveMount("https://acme.com/crm/orders/7", http)
        assertEquals("https://acme.com/crm", mount.baseUrl)
        assertEquals("orders/7", mount.route)
        val nothing = HubManifest.resolveMount("https://nowhere.io/a", server())
        assertEquals("https://nowhere.io/a", nothing.baseUrl)
        assertTrue(nothing.fetched is HubManifest.Fetch.Failed)
        assertEquals("not a url", HubManifest.resolveMount("not a url", server()).baseUrl)
    }

    // ── what the user brought ─────────────────────────────────────────────────────────────────

    @Test
    fun `a link proposes its UI, already listed or not`() {
        val http = server("https://acme.com/crm/mateu/v3/manifest" to (200 to """{"name":"CRM","auth":{"issuer":"https://id.acme.com","clientId":"crm"}}"""))
        val entries = HubEntries()
        val p = HubFlow.propose("mateu://add?u=acme.com/crm&r=orders", entries, http) as HubFlow.Proposal.AddOne
        assertEquals("https://acme.com/crm", p.baseUrl)
        assertEquals("/orders", p.route)
        assertEquals("CRM", p.manifest.name)
        assertNull(p.existing)
        entries.add(p.baseUrl, p.manifest)
        assertEquals("CRM", (HubFlow.propose("https://mateu.io/add?u=acme.com%2Fcrm", entries, http) as HubFlow.Proposal.AddOne).existing?.name)
    }

    @Test
    fun `a page address is looked up, a foreign code and a bad address say why`() {
        val http = server(
            "https://acme.com/crm/orders/mateu/v3/manifest" to (404 to ""),
            "https://acme.com/crm/mateu/v3/manifest" to (200 to """{"name":"CRM","wireVersion":"3"}"""),
        )
        val p = HubFlow.propose("acme.com/crm/orders", HubEntries(), http) as HubFlow.Proposal.AddOne
        assertEquals("https://acme.com/crm", p.baseUrl)
        assertEquals("/orders", p.route)
        assertEquals(HubFlow.Proposal.Refused("This code is not a Mateu link."), HubFlow.propose("WIFI:S:home;T:WPA;P:x;;", HubEntries(), http))
        assertEquals(HubFlow.Proposal.Refused("Only https addresses can be added."), HubFlow.propose("ftp://acme.com", HubEntries(), http))
        assertEquals(HubFlow.Proposal.Refused("Only secure (https) addresses can be added."), HubFlow.propose("http://acme.com", HubEntries(), http))
        assertTrue((HubFlow.propose("mateu://add?u=down.io", HubEntries(), http) as HubFlow.Proposal.Refused).reason.contains("Can't reach"))
        val static = server("https://s.io/mateu/v3/manifest" to (200 to """{"name":"S","bundle":"manifest.json"}"""))
        assertTrue((HubFlow.propose("mateu://add?u=s.io", HubEntries(), static) as HubFlow.Proposal.Refused).reason.contains("static UI"))
    }

    @Test
    fun `an import counts what is already there`() {
        val entries = HubEntries().apply { add("https://a.io") }
        val p = HubFlow.propose(HubLinks.exportLink(listOf("https://a.io", "https://b.io")), entries, server())
        assertEquals(HubFlow.Proposal.ImportMany(listOf("https://a.io", "https://b.io"), 0, 1), p)
    }

    // ── the list ──────────────────────────────────────────────────────────────────────────────

    @Test
    fun `the list keeps one entry per base url and its order`() {
        var t = 0L
        var n = 0
        val list = HubEntries(now = { ++t }, newId = { "id${++n}" })
        val (a, new) = list.add("https://a.io", HubManifest.Manifest("A", themeColor = "#123456"))
        assertTrue(new)
        assertFalse(list.add("https://a.io").second)
        assertEquals(1, list.importAll(listOf("https://a.io", "https://b.io")))
        assertEquals(listOf("A", "b.io"), list.entries.map { it.name })
        list.move("id2", -1)
        assertEquals(listOf("b.io", "A"), list.entries.map { it.name })
        list.move("id2", -1) // already first
        list.move("nope", 1)
        list.refresh("id2", HubManifest.Manifest("Bee", shortName = "B"))
        list.touch(a.id)
        assertEquals(3L, list.get(a.id)?.lastOpened)
        list.rename(a.id, "  Acme  ")
        list.rename(a.id, "   ")
        assertEquals("Acme", list.get(a.id)?.name)
        assertEquals(listOf("Bee"), list.search("bee b.io").map { it.name })
        assertEquals(2, list.search("  ").size)
        assertEquals("Bee", list.remove("id2")?.name)
        assertNull(list.remove("id2"))
        assertEquals(listOf("Acme"), list.entries.map { it.name })
    }

    @Test
    fun `stored entries are re-validated`() {
        val stored = listOf(
            HubEntry("1", "https://A.io/", ""),
            HubEntry("2", "https://a.io", "dup"),
            HubEntry("3", "javascript:alert(1)", "x"),
            HubEntry("", "https://c.io", "no id"),
            HubEntry("4", "http://localhost:8080", "dev"),
        )
        assertEquals(listOf("https://a.io" to "a.io", "http://localhost:8080" to "dev"), HubEntries(stored).entries.map { it.baseUrl to it.name })
        assertTrue(HubEntries.randomId().matches(Regex("u[0-9a-f]{18}")))
    }

    @Test
    fun `entries survive the xml bean round trip`() {
        val e = HubEntry("u1", "https://a.io", "A", "A!", "https://a.io/i.png", "#fff", HubManifest.Auth("https://id", "c", listOf("openid", "x"), "api"), 5, 9)
        assertEquals(e, HubStore.fromBean(HubStore.toBean(e)))
        val bare = HubEntry("u2", "https://b.io", "B")
        assertEquals(bare, HubStore.fromBean(HubStore.toBean(bare)))
    }

    // ── QR codes ──────────────────────────────────────────────────────────────────────────────

    @Test
    fun `a QR code drawn by the share dialog is read back from an image`() {
        val link = HubLinks.addLink("https://acme.com/crm", "/orders/7")
        val panel = QrPanel(link, "test")
        panel.setSize(panel.preferredSize)
        val image = BufferedImage(panel.width + 200, panel.height + 120, BufferedImage.TYPE_INT_RGB)
        image.createGraphics().apply {
            color = java.awt.Color.LIGHT_GRAY
            fillRect(0, 0, image.width, image.height)
            translate(100, 60)
            panel.paint(this)
            dispose()
        }
        assertEquals(listOf(link), HubQr.decode(image))
        val file = File.createTempFile("mateu-qr", ".png").apply { deleteOnExit() }
        ImageIO.write(image, "png", file)
        assertEquals(listOf(link), HubQr.fromFile(file))
        assertEquals(HubLinks.Link.Add("https://acme.com/crm", "/orders/7"), HubLinks.parse(HubQr.pick(HubQr.fromFile(file))))
        assertEquals(emptyList<String>(), HubQr.decode(BufferedImage(50, 50, BufferedImage.TYPE_INT_RGB)))
        assertEquals(emptyList<String>(), HubQr.fromFile(File("/nope.png")))
    }

    @Test
    fun `the Mateu code wins among several`() {
        assertEquals("mateu://add?u=a.io", HubQr.pick(listOf("WIFI:S:x;;", "mateu://add?u=a.io")))
        assertEquals("https://a.io/page", HubQr.pick(listOf("https://a.io/page")))
        assertNull(HubQr.pick(emptyList()))
        val img = java.awt.Toolkit.getDefaultToolkit().createImage(ByteArray(0))
        assertTrue(HubQr.toBuffered(BufferedImage(3, 3, BufferedImage.TYPE_INT_RGB)).width == 3)
        assertTrue(img != null)
    }

    // ── wiring ────────────────────────────────────────────────────────────────────────────────

    @Test
    fun `the protocol handler rebuilds the link whatever the platform handed over`() {
        assertEquals("mateu://add?u=a.io", MateuProtocolHandler.asLink("add?u=a.io"))
        assertEquals("mateu://add?u=a.io", MateuProtocolHandler.asLink("//add?u=a.io"))
        assertEquals("mateu://add?u=a.io", MateuProtocolHandler.asLink("mateu://add?u=a.io"))
        assertEquals("MATEU:///add?u=a.io", MateuProtocolHandler.asLink("MATEU:///add?u=a.io"))
    }

    @Test
    fun `the hub is the standalone app's hub variant only`() {
        fun cfg(vararg props: Pair<String, String>) = resolveMateuConfig(props.toMap()::get, null, Properties())
        assertTrue(cfg("mateu.focused" to "true", "mateu.variant" to "HUB").hub)
        assertFalse(cfg("mateu.focused" to "true", "mateu.variant" to "fixed").hub)
        assertFalse(cfg("mateu.focused" to "true").hub)
        assertFalse(cfg("mateu.variant" to "hub").hub) // a developer's IDE never becomes a hub
        assertEquals(false, hubOptions().allowInsecure)
    }
}
