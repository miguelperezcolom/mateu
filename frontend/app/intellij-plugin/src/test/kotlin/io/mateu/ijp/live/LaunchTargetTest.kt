package io.mateu.ijp.live

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.nio.file.Files

class LaunchTargetTest {

    @Test
    fun `the Android emulator reaches this machine's loopback through 10_0_2_2`() {
        assertEquals("http://10.0.2.2:8080", emulatorUrlOf("http://localhost:8080"))
        assertEquals("http://10.0.2.2:3000/app", emulatorUrlOf("http://127.0.0.1:3000/app"))
        // only the loopback host is rewritten
        assertEquals("http://localhostess:8080", emulatorUrlOf("http://localhostess:8080"))
        assertEquals("https://example.com", emulatorUrlOf("https://example.com"))
    }

    @Test
    fun `a phone reaches the app at the LAN address`() {
        assertEquals("http://192.168.1.20:8080", lanUrlOf("http://localhost:8080", "192.168.1.20"))
    }

    @Test
    fun `the links are the Mateu app's add links, the base URL encoded`() {
        assertEquals("mateu://add?u=http%3A%2F%2F10.0.2.2%3A8080", appLinkOf("http://10.0.2.2:8080"))
        assertEquals("https://mateu.io/add?u=http%3A%2F%2F192.168.1.20%3A3000", universalLinkOf("http://192.168.1.20:3000"))
    }

    @Test
    fun `simulators open the app link, the emulator at its own loopback`() {
        assertEquals(
            listOf("/sdk/platform-tools/adb", "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d",
                "mateu://add?u=http%3A%2F%2F10.0.2.2%3A8080"),
            simulatorCommandOf(LaunchTarget.ANDROID_EMULATOR, "http://localhost:8080", "/sdk/platform-tools/adb"),
        )
        assertEquals(
            listOf("xcrun", "simctl", "openurl", "booted", "mateu://add?u=http%3A%2F%2Flocalhost%3A8080"),
            simulatorCommandOf(LaunchTarget.IOS_SIMULATOR, "http://localhost:8080"),
        )
        assertNull(simulatorCommandOf(LaunchTarget.WEB, "http://localhost:8080"))
        assertNull(simulatorCommandOf(LaunchTarget.DESKTOP, "http://localhost:8080"))
        assertNull(simulatorCommandOf(LaunchTarget.PHONE, "http://localhost:8080"))
    }

    @Test
    fun `adb comes from the Android SDK when there is one, else from the PATH`() {
        val sdk = Files.createTempDirectory("sdk").toFile()
        val adb = File(sdk, "platform-tools/adb").apply { parentFile.mkdirs(); writeText("") }
        assertEquals(adb.absolutePath, adbOf(env = { if (it == "ANDROID_HOME") sdk.path else null }, home = "/nowhere"))
        assertEquals("adb", adbOf(env = { null }, home = "/nowhere"))
    }

    @Test
    fun `only the phone needs the app on the network, and desktop cannot open a static bundle`() {
        assertTrue(LaunchTarget.PHONE.needsLan)
        assertFalse(LaunchTarget.WEB.needsLan)
        assertNotNull(LaunchTarget.DESKTOP.unsupportedReason(Framework.STATIC_BUNDLE))
        assertNull(LaunchTarget.DESKTOP.unsupportedReason(Framework.SPRING_BOOT))
        assertNull(LaunchTarget.ANDROID_EMULATOR.unsupportedReason(Framework.STATIC_BUNDLE))
    }
}
