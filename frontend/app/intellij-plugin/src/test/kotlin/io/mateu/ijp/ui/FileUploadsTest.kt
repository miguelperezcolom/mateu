package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.nio.file.Files

/** The file-upload contract on the desktop (design/uploads/file-uploads-contract.md). */
class FileUploadsTest : TestCase() {
    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    fun testAttributesComeAsPairsOrAsAMap() {
        assertEquals(mapOf("accept" to ".pdf"), FileUploads.attributesOf(json("""[{"key":"accept","value":".pdf"},{"key":"x"}]""")))
        assertEquals(mapOf("multiple" to "true", "maxBytes" to "5"), FileUploads.attributesOf(json("""{"multiple":true,"maxBytes":5}""")))
    }

    fun testTheTicketSwitchesTheFieldToUploadMode() {
        val c = FileUploads.configOf(json("""{"attributes":[{"key":"uploadUrl","value":"/mateu/v3/upload"},{"key":"uploadTicket","value":"t.s"},
            {"key":"uploadDirect","value":"true"},{"key":"multiple","value":"true"},{"key":"maxBytes","value":"2048"}]}"""))
        assertTrue(c.uploadMode)
        assertTrue(c.uploadDirect)
        assertTrue(c.multiple)
        assertEquals(2048L, c.fallbackMaxBytes)
        val plain = FileUploads.configOf(json("""{"attributes":[{"key":"accept","value":"image/*"}]}"""))
        assertFalse(plain.uploadMode)
        assertEquals(10485760L, plain.fallbackMaxBytes)
    }

    fun testSizesPrintInA1024Base() {
        assertEquals("0 bytes", FileUploads.formatBytes(0))
        assertEquals("1023 bytes", FileUploads.formatBytes(1023))
        assertEquals("1 KB", FileUploads.formatBytes(1024))
        assertEquals("1.5 KB", FileUploads.formatBytes(1536))
        assertEquals("20 MB", FileUploads.formatBytes(20L * 1024 * 1024))
        assertEquals("3 GB", FileUploads.formatBytes(3L * 1024 * 1024 * 1024))
        assertEquals("This file is too large (max 10 MB).", FileUploads.tooLargeMessage(10485760))
    }

    fun testAReferenceRoundTripsAndPlusIsLiteral() {
        val ref = FileUploads.FileRef("a/b 1", "Informe (v2)+ñ.pdf", "application/pdf", 1536, "https://cdn.x/a?b=1")
        val value = FileUploads.toValue(ref)
        assertEquals("mateu-file:a%2Fb%201?name=Informe%20%28v2%29%2B%C3%B1.pdf&type=application%2Fpdf&size=1536&url=https%3A%2F%2Fcdn.x%2Fa%3Fb%3D1", value)
        assertEquals(ref, FileUploads.parse(value))
        assertEquals("a+b", FileUploads.parse("mateu-file:x?name=a+b")?.name)
        assertEquals(FileUploads.FileRef("only"), FileUploads.parse("mateu-file:only"))
        assertNull(FileUploads.parse("data:text/plain;base64,aGk="))
        assertEquals("mateu-file:x", FileUploads.toValue(FileUploads.FileRef("x")))
        assertEquals("100%", FileUploads.percentDecode("100%"))
        assertEquals("a.pdf (2 KB)", FileUploads.label(FileUploads.FileRef("k", "a.pdf", size = 2048)))
        assertEquals("k", FileUploads.label(FileUploads.FileRef("k")))
    }

    fun testMultipleAppendsSingleReplaces() {
        assertEquals(listOf("a", "b"), FileUploads.withFile(listOf("a"), "b", true))
        assertEquals("b", FileUploads.withFile(listOf("a"), "b", false))
        assertEquals(listOf("a", "c"), FileUploads.withoutFile(listOf("a", "b", "c"), 1, true))
        assertEquals(listOf("a", "b"), FileUploads.valuesOf(json("""["a","b"]""")))
        assertEquals(emptyList<String>(), FileUploads.valuesOf(json("\"\"")))
    }

    fun testTheUploadUrlResolvesAgainstTheBackendOrigin() {
        assertEquals("https://h.io/mateu/v3/upload", FileUploads.resolveUploadUrl("https://h.io/app", "/mateu/v3/upload"))
        assertEquals("https://h.io/app/up", FileUploads.resolveUploadUrl("https://h.io/app", "up"))
        assertEquals("https://o.io/u", FileUploads.resolveUploadUrl("https://h.io", "https://o.io/u"))
    }

    fun testAnswers() {
        assertEquals("This file is too large (max 20 MB).", FileUploads.errorOf(413, """{"error":"Too large","message":"This file is too large (max 20 MB)."}"""))
        assertEquals("This upload is not allowed.", FileUploads.errorOf(403, "nope"))
        assertEquals(FileUploads.Target("https://s3/x", "PUT", mapOf("x-a" to "1"), "mateu-file:x"),
            FileUploads.targetOf("""{"url":"https://s3/x","headers":{"x-a":"1"},"value":"mateu-file:x"}"""))
    }

    // ── the protocol over a fake transport ──

    private val credentials: (String) -> Map<String, String> = { url -> if (url.startsWith("https://app.io/")) mapOf("Authorization" to "Bearer T") else emptyMap() }
    private val streamed = FileUploads.Config(uploadUrl = "/mateu/v3/upload", uploadTicket = "TK")
    private val direct = streamed.copy(uploadDirect = true)

    private class Fake(vararg answers: UploadHttpResponse) : UploadTransport {
        val queue = ArrayDeque(answers.toList())
        val seen = mutableListOf<UploadHttpRequest>()
        override fun send(request: UploadHttpRequest, onSent: (Long) -> Unit, cancelled: () -> Boolean): UploadHttpResponse {
            seen += request
            return queue.removeFirstOrNull() ?: UploadHttpResponse(500, "")
        }
    }

    private fun tempFile() = Files.createTempFile("mateu-upload", ".pdf").also { Files.writeString(it, "BYTES"); it.toFile().deleteOnExit() }

    fun testStreamedSendsTheBytesWithTheTicketAndTheCredentials() {
        val fake = Fake(UploadHttpResponse(200, """{"value":"mateu-file:k1","file":{}}"""))
        val file = tempFile()
        val value = FileUploader("https://app.io/ui", credentials, fake).upload(streamed, file, "a b.pdf", "application/pdf", 5)
        assertEquals("mateu-file:k1", value)
        val r = fake.seen.single()
        assertEquals("POST", r.method)
        assertEquals("https://app.io/mateu/v3/upload", r.url)
        assertEquals(file, r.file)
        assertEquals("TK", r.headers["X-Mateu-Upload-Ticket"])
        assertEquals("a%20b.pdf", r.headers["X-Mateu-File-Name"])
        assertEquals("application/pdf", r.headers["Content-Type"])
        assertEquals("Bearer T", r.headers["Authorization"])
    }

    fun testARefusalCarriesTheServerMessage() {
        val fake = Fake(UploadHttpResponse(415, """{"error":"Not accepted","message":"This type of file is not accepted."}"""))
        try {
            FileUploader("https://app.io/ui", credentials, fake).upload(streamed, tempFile(), "a.exe", null, 5)
            fail("expected a refusal")
        } catch (e: UploadException) {
            assertEquals(415, e.status)
            assertEquals("This type of file is not accepted.", e.message)
        }
    }

    fun testDirectSendsTheBytesToTheTargetWithoutMateuCredentials() {
        val fake = Fake(
            UploadHttpResponse(200, """{"url":"https://store.io/put/1","method":"PUT","headers":{"x-amz":"v"},"value":"mateu-file:s1","file":{}}"""),
            UploadHttpResponse(201, ""),
        )
        val value = FileUploader("https://app.io/ui", credentials, fake).upload(direct, tempFile(), "a b.pdf", "application/pdf", 5)
        assertEquals("mateu-file:s1", value)
        val (target, put) = fake.seen
        assertEquals("https://app.io/mateu/v3/upload/target", target.url)
        assertEquals(mapOf("name" to "a b.pdf", "contentType" to "application/pdf", "size" to 5), mapper.readValue(target.text, Map::class.java))
        assertEquals("Bearer T", target.headers["Authorization"])
        assertEquals("PUT", put.method)
        assertEquals("https://store.io/put/1", put.url)
        assertEquals(mapOf("Content-Type" to "application/pdf", "x-amz" to "v"), put.headers)
    }

    fun testADirect404FallsBackToTheStreamedUpload() {
        val fake = Fake(UploadHttpResponse(404, """{"error":"Not found"}"""), UploadHttpResponse(200, """{"value":"mateu-file:k2"}"""))
        assertEquals("mateu-file:k2", FileUploader("https://app.io/ui", credentials, fake).upload(direct, tempFile(), "a.pdf", null, 5))
        assertEquals("https://app.io/mateu/v3/upload", fake.seen[1].url)
    }

    fun testACancelledUploadIsNotAFailure() {
        try {
            FileUploader("https://app.io/ui", credentials, Fake()).upload(streamed, tempFile(), "a.pdf", null, 5, cancelled = { true })
            fail("expected a cancellation")
        } catch (_: UploadCancelledException) {
        }
        val broken = UploadTransport { _, _, _ -> throw java.io.IOException("down") }
        try {
            FileUploader("https://app.io/ui", credentials, broken).upload(streamed, tempFile(), "a.pdf", null, 5)
            fail("expected a failure")
        } catch (e: UploadException) {
            assertEquals(0, e.status)
        }
    }
}
