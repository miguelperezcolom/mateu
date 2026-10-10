package io.mateu.core.infra.documents;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.uidl.data.Document;
import io.mateu.uidl.data.DocumentDisposition;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class DocumentDownloadsTest {

  static final byte[] BYTES = {1, 2, 3};

  /** A clock the test moves by hand. */
  static class MovableClock extends Clock {
    Instant now = Instant.parse("2026-10-10T10:00:00Z");

    @Override
    public ZoneOffset getZone() {
      return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(java.time.ZoneId zone) {
      return this;
    }

    @Override
    public Instant instant() {
      return now;
    }
  }

  @Test
  void aTokenIsSingleUse() {
    var store = new DocumentStore(Duration.ofMinutes(5));
    String token = store.park(Document.pdf("a.pdf", BYTES));
    assertThat(token).matches("[A-Za-z0-9_-]{43}");
    String path = "/app/mateu/v3/documents/" + token;
    assertThat(DocumentDownloads.serve(path, store).status()).isEqualTo(200);
    assertThat(DocumentDownloads.serve(path, store).status()).isEqualTo(404);
    assertThat(store.size()).isZero();
  }

  @Test
  void anExpiredTokenServesNothing() {
    var clock = new MovableClock();
    var store = new DocumentStore(Duration.ofSeconds(30), clock);
    String token = store.park(Document.pdf("a.pdf", BYTES));
    clock.now = clock.now.plusSeconds(31);
    var response = DocumentDownloads.serve("/mateu/v3/documents/" + token, store);
    assertThat(response.status()).isEqualTo(404);
    assertThat(response.body()).isEmpty();
  }

  @Test
  void expiredDocumentsAreDroppedWithoutBeingFetched() {
    var clock = new MovableClock();
    var store = new DocumentStore(Duration.ofSeconds(30), clock);
    store.park(Document.pdf("a.pdf", BYTES));
    store.park(Document.pdf("b.pdf", BYTES));
    assertThat(store.size()).isEqualTo(2);
    clock.now = clock.now.plusSeconds(60);
    assertThat(store.size()).isZero();
  }

  @Test
  void theStoreIsBounded() {
    var store = new DocumentStore(Duration.ofMinutes(5));
    String first = store.park(Document.pdf("first.pdf", BYTES));
    for (int i = 0; i < DocumentStore.MAX_ENTRIES; i++) {
      store.park(Document.pdf(i + ".pdf", BYTES));
    }
    assertThat(store.size()).isEqualTo(DocumentStore.MAX_ENTRIES);
    // the oldest made room
    assertThat(store.take(first)).isEmpty();
  }

  @Test
  void onlyWellFormedTokensAreEndpoints() {
    assertThat(DocumentDownloads.isEndpoint("/mateu/v3/documents/abcdefghijklmnopqrstuvwxyz"))
        .isTrue();
    assertThat(DocumentDownloads.isEndpoint("/x/mateu/v3/documents/short")).isFalse();
    assertThat(DocumentDownloads.isEndpoint("/x/mateu/v3/documents/../../etc/passwd")).isFalse();
    assertThat(DocumentDownloads.isEndpoint("/x/mateu/v3/sync/abcdefghijklmnopqrstuvwxyz"))
        .isFalse();
    assertThat(DocumentDownloads.isEndpoint(null)).isFalse();
    assertThat(DocumentDownloads.serve("/mateu/v3/documents/nope").status()).isEqualTo(404);
  }

  @Test
  void contentDispositionIsSafeAndKeepsTheRealNameInFilenameStar() {
    assertThat(
            DocumentDownloads.contentDisposition(DocumentDisposition.attachment, "Factura ñ €.pdf"))
        .isEqualTo(
            "attachment; filename=\"Factura _ _.pdf\";"
                + " filename*=UTF-8''Factura%20%C3%B1%20%E2%82%AC.pdf");
    String hostile =
        DocumentDownloads.contentDisposition(
            DocumentDisposition.inline, "a\r\nSet-Cookie: x=1\"; b=\\..\\..\\x.pdf");
    assertThat(hostile).doesNotContain("\r").doesNotContain("\n");
    assertThat(hostile).startsWith("inline; filename=\"a__Set-Cookie: x=1_; b=_.._.._x.pdf\";");
    assertThat(DocumentDownloads.safeFilename("../../etc/passwd")).isEqualTo("_.._etc_passwd");
    assertThat(DocumentDownloads.safeFilename("  ")).isEqualTo("document");
    assertThat(DocumentDownloads.safeFilename("a‮gpj.exe")).isEqualTo("a_gpj.exe");
  }

  @Test
  void mediaTypesAreValidated() {
    assertThat(DocumentDownloads.safeMediaType("application/pdf")).isEqualTo("application/pdf");
    assertThat(DocumentDownloads.safeMediaType("text/csv; charset=utf-8"))
        .isEqualTo("text/csv; charset=utf-8");
    assertThat(DocumentDownloads.safeMediaType("text/html\r\nX: 1"))
        .isEqualTo("application/octet-stream");
    assertThat(DocumentDownloads.safeMediaType("nonsense")).isEqualTo("application/octet-stream");
  }

  @Test
  void anActiveTypeShownInlineIsSandboxed() {
    var store = new DocumentStore(Duration.ofMinutes(5));
    String html = store.park(Document.inline("x.html", "text/html", BYTES));
    String pdf = store.park(Document.pdf("x.pdf", BYTES));
    assertThat(DocumentDownloads.serve("/mateu/v3/documents/" + html, store).headers())
        .containsEntry("Content-Security-Policy", "sandbox");
    assertThat(DocumentDownloads.serve("/mateu/v3/documents/" + pdf, store).headers())
        .doesNotContainKey("Content-Security-Policy");
  }

  @Test
  void aFailingLazyDocumentAnswers500() {
    var store = new DocumentStore(Duration.ofMinutes(5));
    String token =
        store.park(
            Document.lazy(
                "x.pdf",
                Document.PDF,
                () -> {
                  throw new IllegalStateException("boom");
                }));
    assertThat(DocumentDownloads.serve("/mateu/v3/documents/" + token, store).status())
        .isEqualTo(500);
  }

  @Test
  void theUrlHangsFromTheBaseUrl() {
    assertThat(DocumentCommands.urlFor("/admin/", "tok"))
        .isEqualTo("/admin/mateu/v3/documents/tok");
    assertThat(DocumentCommands.urlFor("", "tok")).isEqualTo("/mateu/v3/documents/tok");
    assertThat(DocumentCommands.urlFor(null, "tok")).isEqualTo("/mateu/v3/documents/tok");
  }

  @Test
  void documentRules() {
    assertThatThrownBy(() -> new Document("x", null, null, null, null, false))
        .isInstanceOf(IllegalArgumentException.class);
    var d = new Document("x", null, BYTES, null, null, true);
    assertThat(d.mediaType()).isEqualTo("application/octet-stream");
    assertThat(d.disposition()).isEqualTo(DocumentDisposition.attachment);
    assertThat(d.print()).isFalse(); // an attachment is never printed
    assertThat(d.showInline().disposition()).isEqualTo(DocumentDisposition.inline);
    assertThat(Document.pdf("x", BYTES).printed().print()).isTrue();
    assertThat(Document.pdf("x", BYTES).printed().downloaded().print()).isFalse();
    assertThat(Document.lazy("x", Document.PDF, () -> BYTES).bytes()).isEqualTo(BYTES);
  }
}
