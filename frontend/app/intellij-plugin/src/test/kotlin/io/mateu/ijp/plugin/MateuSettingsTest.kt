package io.mateu.ijp.plugin

import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.auth.MateuAuthService
import io.mateu.ijp.plugin.MateuSettings.AuthMode

/** The project service, the effective config and the credential-store-backed token, wired together. */
class MateuSettingsTest : BasePlatformTestCase() {

    override fun tearDown() {
        try {
            MateuAuthService.getInstance(project).signOut()
            MateuSettings.getInstance(project).loadState(MateuSettings.State())
        } finally {
            super.tearDown()
        }
    }

    fun testAnUnconfiguredProjectIsLeftAlone() {
        assertFalse(loadMateuConfig(project).configured)
        assertFalse(MateuToolWindowFactory().shouldBeAvailable(project))
        assertNull(MateuAuthService.getInstance(project).accessToken())
    }

    fun testProjectSettingsDriveTheEffectiveConfig() {
        MateuSettings.getInstance(project).state.baseUrl = "http://localhost:9100/"
        val cfg = loadMateuConfig(project)
        assertTrue(cfg.configured)
        assertEquals("http://localhost:9100", cfg.baseUrl)
        assertTrue(MateuToolWindowFactory().shouldBeAvailable(project))
    }

    fun testManualTokenLivesInTheCredentialStoreKeyedByBackend() {
        val settings = MateuSettings.getInstance(project).state
        settings.baseUrl = "http://localhost:9100"
        settings.authMode = AuthMode.TOKEN
        val auth = MateuAuthService.getInstance(project)
        auth.setManualToken("secret-1")
        assertEquals("secret-1", auth.accessToken())
        assertTrue(auth.isSignedIn())
        // Another backend never receives this project's previous token.
        settings.baseUrl = "http://other:9200"
        assertNull(auth.accessToken())
        settings.baseUrl = "http://localhost:9100"
        auth.signOut()
        assertNull(auth.accessToken())
    }

    fun testNoneModeSendsNothingEvenWithAStoredToken() {
        val settings = MateuSettings.getInstance(project).state
        settings.baseUrl = "http://localhost:9100"
        settings.authMode = AuthMode.TOKEN
        MateuAuthService.getInstance(project).setManualToken("secret-2")
        settings.authMode = AuthMode.NONE
        assertNull(MateuAuthService.getInstance(project).accessToken())
    }
}
