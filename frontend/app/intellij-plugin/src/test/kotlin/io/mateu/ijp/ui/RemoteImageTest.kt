package io.mateu.ijp.ui

import junit.framework.TestCase

/** An uploadable image's value may be a URL (typed in on the web): only http(s) is fetched. */
class RemoteImageTest : TestCase() {

    fun testOnlyHttpUrlsAreFetchedAsImages() {
        assertTrue(isRemoteImage("https://images.nasa.gov/a~medium.jpg"))
        assertTrue(isRemoteImage(" HTTP://localhost:8080/a.png"))
        for (other in listOf("", "data:image/png;base64,AAAA", "/images/a.png", "file:///etc/passwd", "javascript:x")) {
            assertFalse(other, isRemoteImage(other))
        }
    }
}
