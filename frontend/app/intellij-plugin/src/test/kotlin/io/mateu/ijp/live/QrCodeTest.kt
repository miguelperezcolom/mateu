package io.mateu.ijp.live

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * The IDE's QR encoder is a copy of the bundle plugin's: both must give the web encoder's symbol for
 * the same text, module for module. The golden corpus is the bundle plugin's (written by the web lib's
 * `encodeQr`), read in place so the copies cannot drift apart.
 */
class QrCodeTest {

    private val golden = File("../../../backend/mateu-bundle-maven-plugin/src/test/resources/qr-golden.json")

    @Test
    fun `every symbol matches the web encoder`() {
        val cases = ObjectMapper().readTree(golden).get("cases")
        assertTrue(cases.size() > 0)
        for (c in cases) {
            val text = c.get("text").asText()
            val qr = QrCode.encode(text, QrCode.Ecc.valueOf(c.get("ecc").asText()))
            assertEquals(text, c.get("version").asInt(), qr.version)
            val rows = (0 until qr.size).map { y -> (0 until qr.size).joinToString("") { x -> if (qr.modules[y][x]) "1" else "0" } }
            assertEquals(text, c.get("rows").map { it.asText() }, rows)
        }
    }
}
