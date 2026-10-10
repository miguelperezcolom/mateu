package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.documents.DocumentDownloads;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Document;
import io.mateu.uidl.data.FileDownload;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An action that returns a {@link Document} (or {@link UICommand#print()}): what reaches the wire —
 * a {@code DownloadFile} command carrying the bytes inline when small, a single-use URL when large
 * or lazy — and what that URL then serves.
 */
class DocumentsSyncTest {

  static final byte[] SMALL = "%PDF-1.4 small".getBytes(StandardCharsets.US_ASCII);
  static final byte[] LARGE = new byte[400 * 1024];
  static final AtomicInteger lazyCalls = new AtomicInteger();

  @SuppressWarnings("unused")
  @UI("/documents")
  public static class DocumentsPage {

    String name = "Folio";

    @Action
    Document preview() {
      return Document.pdf("folio.pdf", SMALL);
    }

    @Action
    Document download() {
      return Document.attachment("export.csv", "text/csv", "a;b".getBytes());
    }

    @Action
    Document large() {
      return Document.pdf("report.pdf", LARGE);
    }

    @Action
    Document lazy() {
      return Document.lazy(
          "lazy.pdf",
          Document.PDF,
          () -> {
            lazyCalls.incrementAndGet();
            return SMALL;
          });
    }

    @Action
    Document printFolio() {
      return Document.pdf("folio.pdf", SMALL).printed();
    }

    @Action
    List<Object> withMessage() {
      return List.of(new Message("Invoice ready"), Document.pdf("invoice.pdf", SMALL));
    }

    @Action
    UICommand printPage() {
      return UICommand.print();
    }

    @Action
    Document hostile() {
      return Document.attachment(
          "evil\r\nSet-Cookie: x=1\";.pdf", "text/html\r\nX-Injected: 1", SMALL);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(DocumentsPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(String actionId) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/documents")
            .actionId(actionId)
            .serverSideType(DocumentsPage.class.getName())
            .initiatorComponentId("cmp-1")
            .componentState(Map.of("name", "Folio"))
            .build());
  }

  private static FileDownload theDownload(UIIncrementDto increment) {
    List<UICommandDto> downloads =
        increment.commands().stream()
            .filter(c -> c.type() == UICommandTypeDto.DownloadFile)
            .toList();
    assertThat(downloads).hasSize(1);
    return (FileDownload) downloads.get(0).data();
  }

  @Test
  void aSmallInlinePdfTravelsBase64InTheResponse() {
    var increment = run("preview");
    var file = theDownload(increment);
    assertThat(file.filename()).isEqualTo("folio.pdf");
    assertThat(file.mimeType()).isEqualTo("application/pdf");
    assertThat(file.disposition()).isEqualTo("inline");
    assertThat(file.print()).isFalse();
    assertThat(file.url()).isNull();
    assertThat(Base64.getDecoder().decode(file.base64Content())).isEqualTo(SMALL);
    // a document is behaviour, not a page: no fragment, no window title from its toString()
    assertThat(increment.fragments()).isEmpty();
    assertThat(increment.commands()).noneMatch(c -> c.type() == UICommandTypeDto.SetWindowTitle);
  }

  @Test
  void anAttachmentIsDownloaded() {
    var file = theDownload(run("download"));
    assertThat(file.disposition()).isEqualTo("attachment");
    assertThat(file.mimeType()).isEqualTo("text/csv");
  }

  @Test
  void aLargeDocumentTravelsBehindASingleUseUrl() {
    var file = theDownload(run("large"));
    assertThat(file.base64Content()).isNull();
    assertThat(file.url()).startsWith("/mateu/v3/documents/");
    assertThat(DocumentDownloads.isEndpoint(file.url())).isTrue();

    var first = DocumentDownloads.serve(file.url());
    assertThat(first.status()).isEqualTo(200);
    assertThat(first.body()).isEqualTo(LARGE);
    assertThat(first.headers())
        .containsEntry("Content-Type", "application/pdf")
        .containsEntry(
            "Content-Disposition", "inline; filename=\"report.pdf\"; filename*=UTF-8''report.pdf")
        .containsEntry("Content-Length", String.valueOf(LARGE.length))
        .containsEntry("Cache-Control", "no-store")
        .containsEntry("X-Content-Type-Options", "nosniff");

    // single use: the second fetch finds nothing
    assertThat(DocumentDownloads.serve(file.url()).status()).isEqualTo(404);
  }

  @Test
  void aLazyDocumentIsProducedOnlyWhenFetched() {
    lazyCalls.set(0);
    var file = theDownload(run("lazy"));
    assertThat(file.url()).isNotNull();
    assertThat(file.disposition()).isEqualTo("attachment");
    assertThat(lazyCalls.get()).isZero();
    var served = DocumentDownloads.serve(file.url());
    assertThat(served.status()).isEqualTo(200);
    assertThat(served.body()).isEqualTo(SMALL);
    assertThat(lazyCalls.get()).isEqualTo(1);
  }

  @Test
  void aPrintedDocumentAsksTheClientToPrintIt() {
    var file = theDownload(run("printFolio"));
    assertThat(file.disposition()).isEqualTo("inline");
    assertThat(file.print()).isTrue();
  }

  @Test
  void aDocumentRidesWithAMessage() {
    var increment = run("withMessage");
    assertThat(theDownload(increment).filename()).isEqualTo("invoice.pdf");
    assertThat(increment.messages()).hasSize(1);
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void printReachesTheWire() {
    var increment = run("printPage");
    assertThat(increment.commands())
        .anyMatch(c -> c.type() == UICommandTypeDto.Print && c.data() == null);
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void aHostileFilenameOrMediaTypeNeverReachesAHeaderRaw() {
    var file = theDownload(run("hostile"));
    assertThat(file.filename()).doesNotContain("\r").doesNotContain("\n");
    assertThat(file.mimeType()).isEqualTo("application/octet-stream");
  }
}
