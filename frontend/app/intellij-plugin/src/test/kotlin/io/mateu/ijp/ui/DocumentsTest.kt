package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import java.awt.image.BufferedImage
import java.awt.print.PageFormat
import java.awt.print.Printable
import javax.swing.JPanel
import junit.framework.TestCase

/** Unit tests for the document plan (mirrors the RN documents tests). */
class DocumentsTest : TestCase() {

    private fun json(s: String) = ObjectMapper().readTree(s)

    fun testAParkedDocumentIsFetchedFromTheBackendOrigin() {
        val plan = Documents.planOf(
            json("""{"filename":"big.pdf","mimeType":"application/pdf","url":"/hotel/mateu/v3/documents/tok","disposition":"inline","print":true}"""),
            "http://localhost:8080/hotel",
        )!!
        assertEquals("http://localhost:8080/hotel/mateu/v3/documents/tok", plan.url)
        assertNull(plan.base64)
        assertTrue(plan.inline)
        assertTrue(plan.print)
    }

    private fun inline(filename: String, mimeType: String?, disposition: String = "inline") = Documents.planOf(
        json("""{"filename":"$filename"${if (mimeType != null) ""","mimeType":"$mimeType"""" else ""},"base64Content":"YQ==","disposition":"$disposition"}"""),
        "http://x",
    )!!

    fun testOnlyAViewerTypeOpensWithTheOsUnasked() {
        assertTrue(Documents.opensWithOs(inline("report.pdf", "application/pdf")))
        assertTrue(Documents.opensWithOs(inline("REPORT.PDF", "application/pdf; qs=1")))
        assertTrue(Documents.opensWithOs(inline("a.jpeg", "image/jpeg")))
        assertTrue(Documents.opensWithOs(inline("notes.txt", "text/plain; charset=utf-8")))
    }

    fun testWhatARemoteServerNamesIsNeverRunByTheOs() {
        for (name in listOf("report.bat", "x.exe", "x.cmd", "x.vbs", "x.jar", "x.hta", "x.desktop", "x.lnk", "noextension", "x.pdf.exe", "x.csv")) {
            assertFalse(name, Documents.opensWithOs(inline(name, "application/pdf")))
        }
        // the name and the MIME type have to agree, and both have to be there
        assertFalse(Documents.opensWithOs(inline("report.pdf", "application/x-msdownload")))
        assertFalse(Documents.opensWithOs(inline("report.pdf", null)))
        assertFalse(Documents.opensWithOs(inline("report.pdf", "application/pdf", disposition = "attachment")))
    }

    fun testInlineBytesAreDecoded() {
        val plan = Documents.planOf(json("""{"filename":"a.csv","mimeType":"text/csv","base64Content":"YTtiCg=="}"""), "http://x")!!
        assertFalse(plan.inline)
        assertFalse(plan.print)
        assertEquals("a;b\n", String(Documents.bytesOf(plan)))
    }

    fun testOnlyHttpUrlsAndUsablePayloadsArePlanned() {
        assertNull(Documents.planOf(json("""{"filename":"x"}"""), "http://x"))
        assertNull(Documents.planOf(json("""{"url":"javascript:alert(1)"}"""), "http://x"))
        assertNull(Documents.documentUrl("//evil.example/a", "http://x"))
        assertNull(Documents.documentUrl("/a", "not-a-url"))
        // print only when shown
        assertFalse(Documents.planOf(json("""{"base64Content":"eA==","print":true}"""), "http://x")!!.print)
    }

    fun testFileNamesCarryNoPath() {
        assertEquals("_.._etc_passwd", Documents.safeFileName("../../etc/passwd"))
        assertEquals("a__b.pdf", Documents.safeFileName("a\r\nb.pdf"))
        assertEquals("document", Documents.safeFileName(" "))
        assertEquals("Factura ñ.pdf", Documents.safeFileName("Factura ñ.pdf"))
    }

    fun testTheTempFileKeepsTheDocumentName() {
        val plan = Documents.planOf(json("""{"filename":"folio.pdf","base64Content":"JVBERi0="}"""), "http://x")!!
        val file = Documents.tempFileOf(plan, Documents.bytesOf(plan))
        assertEquals("folio.pdf", file.name)
        assertEquals("%PDF-", file.readText())
    }

    fun testAPanelPrintsAcrossPages() {
        val panel = JPanel().apply { setSize(400, 2000) }
        val printable = Documents.ComponentPrintable(panel)
        val format = PageFormat()
        val g = BufferedImage(10, 10, BufferedImage.TYPE_INT_RGB).createGraphics()
        assertEquals(Printable.PAGE_EXISTS, printable.print(g, format, 0))
        assertEquals(Printable.NO_SUCH_PAGE, printable.print(g, format, 50))
    }
}
