package io.mateu.ijp.hub

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** The desktop's reading of `auth.providers`, the provider it picks without asking, and what an entry keeps. */
class SignInProvidersTest {

    private val mapper = ObjectMapper()
    private val base = "https://crm.acme.com"

    private val manifestJson = """
        {"name":"CRM","auth":{"type":"oidc","issuer":"https://accounts.google.com","clientId":"g","loginOnStart":false,
          "providers":[
            {"id":"google","type":"oidc","label":"Google","icon":"google","issuer":"https://accounts.google.com/","clientId":"g","scopes":["openid"]},
            {"id":"lab","type":"oidc","issuer":"http://lab.acme.com","clientId":"l"},
            {"id":"github","type":"redirect","url":"/oauth2/authorization/github","platforms":["web","desktop"]},
            {"id":"acme","type":"oidc","issuer":"https://id.acme.com/realms/acme","clientId":"a","icon":"acme-logo","audience":"api"}
          ]}}
    """.trimIndent()

    @Test
    fun `the manifest keeps every https oidc provider for the desktop, the first is also auth`() {
        val m = HubManifest.parse(mapper.readTree(manifestJson), base)
        assertEquals(listOf("google", "acme"), m.providers.map { it.id })
        assertEquals("google", m.auth?.id)
        assertEquals("https://accounts.google.com", m.auth?.issuer)
        assertEquals(listOf("openid"), m.auth?.scopes)
        assertEquals(false, m.loginOnStart)
        val acme = m.providers[1]
        assertEquals("api", acme.audience)
        assertEquals("key", acme.icon)
        assertEquals("id.acme.com", SignInProviders.nameOf(acme))
        assertNull(SignInProviders.initialOf(acme))
        assertEquals("G", SignInProviders.initialOf(m.providers[0]))
    }

    @Test
    fun `a legacy manifest is provider default`() {
        val m = HubManifest.parse(mapper.readTree("""{"name":"X","auth":{"type":"oidc","issuer":"https://id.x.com","clientId":"c"}}"""), base)
        assertEquals(listOf("default"), m.providers.map { it.id })
        assertTrue(m.loginOnStart)
    }

    @Test
    fun `the provider used without asking - signed in, else remembered, else the only one`() {
        val ps = HubManifest.parse(mapper.readTree(manifestJson), base).providers
        assertEquals("acme", SignInProviders.preselected(ps, { it.id == "acme" }, "google")?.id)
        assertEquals("google", SignInProviders.preselected(ps, { false }, "google")?.id)
        assertNull(SignInProviders.preselected(ps, { false }, "gone"))
        assertEquals("google", SignInProviders.preselected(ps.take(1), { false }, null)?.id)
        assertEquals(listOf("acme", "google"), SignInProviders.ordered(ps, "acme").map { it.id })
        assertEquals(listOf("google", "acme"), SignInProviders.ordered(ps, null).map { it.id })
    }

    @Test
    fun `an entry keeps its providers and the one used last, and re-validates them`() {
        val m = HubManifest.parse(mapper.readTree(manifestJson), base)
        val list = HubEntries(newId = { "u1" })
        val (entry, _) = list.add(base, m)
        list.rememberProvider(entry.id, "acme")
        val stored = HubStore.toBean(list.get("u1")!!)
        val back = HubStore.fromBean(stored)
        assertEquals(listOf("google", "acme"), back.providers.map { it.id })
        assertEquals("acme", back.signInProvider)
        assertEquals("api", back.providers[1].audience)
        // the manifest drops the remembered provider → so does the entry
        list.refresh(entry.id, m.copy(providers = m.providers.take(1)))
        assertNull(list.get("u1")!!.signInProvider)
        // an entry stored before the list: its single provider
        stored.authProviders = null
        assertEquals(listOf("default"), HubStore.fromBean(stored).providers.map { it.id })
        // a tampered config file is read through the manifest's rules
        stored.authProviders = """[{"id":"evil","type":"redirect","url":"https://evil"}]"""
        assertEquals(emptyList<String>(), HubStore.fromBean(stored).providers.map { it.id })
    }
}
