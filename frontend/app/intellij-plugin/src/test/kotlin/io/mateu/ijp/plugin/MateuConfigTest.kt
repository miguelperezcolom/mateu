package io.mateu.ijp.plugin

import junit.framework.TestCase
import java.util.Properties

/** Effective config precedence (-D > project settings > bundled > default) and the "configured" gate
 *  that keeps the plugin out of projects without a Mateu backend. */
class MateuConfigTest : TestCase() {

    private fun resolve(
        sys: Map<String, String> = emptyMap(),
        settings: MateuSettings.State? = null,
        bundled: Map<String, String> = emptyMap(),
    ) = resolveMateuConfig({ sys[it] }, settings, Properties().apply { putAll(bundled) })

    fun testNothingConfiguredMeansPluginStaysOff() {
        val cfg = resolve()
        assertFalse(cfg.configured)
        assertFalse(cfg.standalone)
        assertEquals(DEFAULT_BASE_URL, cfg.baseUrl)
        assertEquals("/", cfg.route)
    }

    fun testProjectSettingsConfigureTheProject() {
        val st = MateuSettings.State().apply { baseUrl = "http://localhost:9000/"; route = "/orders" }
        val cfg = resolve(settings = st)
        assertTrue(cfg.configured)
        assertEquals("http://localhost:9000", cfg.baseUrl)
        assertEquals("/orders", cfg.route)
    }

    fun testSystemPropertyWinsOverSettingsAndBundle() {
        val st = MateuSettings.State().apply { baseUrl = "http://settings" }
        val cfg = resolve(
            sys = mapOf("mateu.baseUrl" to "http://sys"),
            settings = st,
            bundled = mapOf("mateu.baseUrl" to "http://bundled"),
        )
        assertEquals("http://sys", cfg.baseUrl)
    }

    fun testSettingsWinOverBundle() {
        val st = MateuSettings.State().apply { baseUrl = "http://settings" }
        assertEquals("http://settings", resolve(settings = st, bundled = mapOf("mateu.baseUrl" to "http://b")).baseUrl)
    }

    fun testBlankSettingsFallThrough() {
        val st = MateuSettings.State().apply { baseUrl = "   " }
        assertFalse(resolve(settings = st).configured)
    }

    fun testRegistryNeedsBothCoordinates() {
        assertFalse(resolve(settings = MateuSettings.State().apply { registryUrl = "https://r" }).configured)
        val both = MateuSettings.State().apply { registryUrl = "https://r"; appId = "app" }
        assertTrue(resolve(settings = both).configured)
    }

    fun testStandaloneDistributionIsAlwaysConfigured() {
        val cfg = resolve(sys = mapOf("mateu.focused" to "true"))
        assertTrue(cfg.configured)
        assertTrue(cfg.standalone)
    }

    fun testOverridesAreListed() {
        val sys = mapOf("mateu.baseUrl" to "x", "mateu.token" to "t")
        assertEquals(listOf("mateu.baseUrl", "mateu.token"), systemOverrides { sys[it] })
    }
}
