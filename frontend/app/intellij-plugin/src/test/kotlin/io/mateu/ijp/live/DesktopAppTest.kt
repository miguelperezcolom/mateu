package io.mateu.ijp.live

import io.mateu.ijp.hub.HubLinks
import io.mateu.ijp.hub.hubOptions
import junit.framework.TestCase

/** The live run's DESKTOP target: the Mateu desktop app (a separate IntelliJ), reached by `mateu://`. */
class DesktopAppTest : TestCase() {

    fun testTheLinkIsTheHubAddLinkTheDesktopAppAccepts() {
        val link = DesktopApp.linkOf("http://localhost:8080/app")
        assertEquals("mateu://add?u=http%3A%2F%2Flocalhost%3A8080%2Fapp", link)
        // the desktop app reads it with its own options: a dev app on this machine is accepted…
        assertEquals(HubLinks.Link.Add("http://localhost:8080/app"), HubLinks.parse(link, hubOptions()))
        // …and plain http anywhere else is still refused
        assertTrue(HubLinks.parse(DesktopApp.linkOf("http://192.168.1.20:8080"), hubOptions()) is HubLinks.Link.Invalid)
    }

    fun testTheOsIsReadFromItsName() {
        assertEquals(DesktopApp.Os.MAC, DesktopApp.osOf("Mac OS X"))
        assertEquals(DesktopApp.Os.WINDOWS, DesktopApp.osOf("Windows 11"))
        assertEquals(DesktopApp.Os.LINUX, DesktopApp.osOf("Linux"))
        assertEquals(DesktopApp.Os.OTHER, DesktopApp.osOf("Plan 9"))
    }

    fun testEachOsIsAskedWhereTheDesktopAppIs() {
        val mac = DesktopApp.handlerProbeOf(DesktopApp.Os.MAC)!!
        assertEquals("osascript", mac[0])
        // by bundle id: on Apple silicon the phone app claims mateu:// too
        assertTrue(mac.last().contains("URLForApplicationWithBundleIdentifier('io.mateu.desktop')"))
        assertEquals(listOf("reg", "query", "HKCR\\mateu\\shell\\open\\command", "/ve"), DesktopApp.handlerProbeOf(DesktopApp.Os.WINDOWS))
        assertEquals(listOf("xdg-mime", "query", "default", "x-scheme-handler/mateu"), DesktopApp.handlerProbeOf(DesktopApp.Os.LINUX))
        assertNull(DesktopApp.handlerProbeOf(DesktopApp.Os.OTHER))
    }

    fun testTheProbesAnswerSaysWhetherItIsInstalled() {
        assertTrue(DesktopApp.handlerFound(DesktopApp.Os.MAC, 0, "/Applications/Mateu.app\n"))
        assertFalse(DesktopApp.handlerFound(DesktopApp.Os.MAC, 0, "\n"))
        assertFalse(DesktopApp.handlerFound(DesktopApp.Os.MAC, 1, "/Applications/Mateu.app"))
        assertTrue(DesktopApp.handlerFound(DesktopApp.Os.LINUX, 0, "mateu.desktop"))
        assertFalse(DesktopApp.handlerFound(DesktopApp.Os.LINUX, 0, ""))
        assertTrue(DesktopApp.handlerFound(DesktopApp.Os.WINDOWS, 0, ""))
        assertFalse(DesktopApp.handlerFound(DesktopApp.Os.WINDOWS, 1, "ERROR: The system was unable to find the specified registry key"))
        assertFalse(DesktopApp.handlerFound(DesktopApp.Os.OTHER, 0, "x"))
    }

    fun testTheLinkGoesToTheDesktopAppNotToWhateverClaimsTheScheme() {
        val link = "mateu://add?u=http%3A%2F%2Flocalhost%3A8080"
        assertEquals(listOf("open", "-b", "io.mateu.desktop", link), DesktopApp.openCommandOf(DesktopApp.Os.MAC, link))
        assertEquals(listOf("rundll32", "url.dll,FileProtocolHandler", link), DesktopApp.openCommandOf(DesktopApp.Os.WINDOWS, link))
        assertEquals(listOf("xdg-open", link), DesktopApp.openCommandOf(DesktopApp.Os.LINUX, link))
        assertNull(DesktopApp.openCommandOf(DesktopApp.Os.OTHER, link))
    }
}
