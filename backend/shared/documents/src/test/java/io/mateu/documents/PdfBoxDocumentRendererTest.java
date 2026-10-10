package io.mateu.documents;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.PageSetup;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

class PdfBoxDocumentRendererTest {

  static final String INVOICE =
      """
      <html><head><title>ignored</title><style>body{color:red}</style></head><body>
      <h1>Invoice 2026-0042</h1>
      <p>Guest: <b>Ana Núñez</b> — room <i>204</i><br>Check-out: 12/10/2026</p>
      <ul><li>Breakfast included</li><li>Late check-out</li></ul>
      <ol><li>First</li><li>Second</li></ol>
      <table>
        <thead><tr><th width="60%">Concept</th><th>Qty</th><th align="right">Amount</th></tr></thead>
        <tbody>
        ROWS
        </tbody>
      </table>
      <hr>
      <p style="text-align: right">Total: <strong>1.234,00 €</strong></p>
      <div style="page-break-before: always"><h2>Terms</h2><p>Paid on arrival 🙂.</p></div>
      </body></html>
      """;

  static String invoice(int rows) {
    StringBuilder sb = new StringBuilder();
    for (int i = 1; i <= rows; i++) {
      sb.append("<tr><td>Night ")
          .append(i)
          .append(" — a long concept that has to wrap inside its column to fit</td><td>1</td>")
          .append("<td align=\"right\">100,00 €</td></tr>");
    }
    return INVOICE.replace("ROWS", sb);
  }

  @Test
  void rendersAMultiPageInvoiceWithPageNumbersAndEmbeddedFonts() throws IOException {
    byte[] pdf =
        new PdfBoxDocumentRenderer()
            .render(
                invoice(60),
                PageSetup.a4().withTitle("Invoice 2026-0042").withHeader("ACME Hotels||{title}"));
    assertThat(new String(pdf, 0, 5)).isEqualTo("%PDF-");
    Path out = Path.of("target", "invoice-sample.pdf");
    Files.createDirectories(out.getParent());
    Files.write(out, pdf);

    try (PDDocument doc = Loader.loadPDF(pdf)) {
      assertThat(doc.getNumberOfPages()).isGreaterThanOrEqualTo(3);
      assertThat(doc.getDocumentInformation().getTitle()).isEqualTo("Invoice 2026-0042");
      String text = new PDFTextStripper().getText(doc);
      assertThat(text)
          .contains("Invoice 2026-0042")
          .contains("Ana Núñez")
          .contains("Breakfast included")
          .contains("1.")
          .contains("Night 60")
          .contains("Total: 1.234,00 €")
          .contains("Terms")
          .contains("Paid on arrival ?.") // no glyph for the emoji: a placeholder, not a crash
          .contains("ACME Hotels")
          .contains("1 / " + doc.getNumberOfPages())
          .doesNotContain("ignored")
          .doesNotContain("color:red");
      // the header row is repeated on the second page
      var stripper = new PDFTextStripper();
      stripper.setStartPage(2);
      stripper.setEndPage(2);
      assertThat(stripper.getText(doc)).contains("Concept").contains("Amount");
      // every font is embedded
      for (var page : doc.getPages()) {
        var resources = page.getResources();
        for (COSName name : resources.getFontNames()) {
          assertThat(resources.getFont(name).isEmbedded()).as(name.getName()).isTrue();
        }
      }
    }
  }

  @Test
  void letterLandscapeAndAnEmptyBody() throws IOException {
    byte[] pdf =
        new PdfBoxDocumentRenderer()
            .render("", PageSetup.letter().withLandscape(true).withFooter(null));
    try (PDDocument doc = Loader.loadPDF(pdf)) {
      assertThat(doc.getNumberOfPages()).isEqualTo(1);
      var box = doc.getPage(0).getMediaBox();
      assertThat(box.getWidth()).isEqualTo(792f);
      assertThat(box.getHeight()).isEqualTo(612f);
    }
  }

  @Test
  void wrapsAWordLongerThanTheLineAndKeepsDataImages() throws IOException {
    String png =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    String html =
        "<p>"
            + "x".repeat(400)
            + "</p><img width=\"40\" src=\"data:image/png;base64,"
            + png
            + "\"><img src=\"http://example.com/tracker.png\"><pre>a\n  b</pre>"
            + "<blockquote>quoted</blockquote><table><tr><td colspan=\"2\">wide</td></tr>"
            + "<tr><td>l</td><td>r</td></tr></table>";
    byte[] pdf = new PdfBoxDocumentRenderer().render(html);
    try (PDDocument doc = Loader.loadPDF(pdf)) {
      String text = new PDFTextStripper().getText(doc);
      assertThat(text.replaceAll("\\s", "")).contains("x".repeat(400));
      assertThat(text).contains("quoted").contains("wide");
      int images = 0;
      for (var page : doc.getPages()) {
        for (COSName name : page.getResources().getXObjectNames()) {
          images++;
        }
      }
      assertThat(images).isEqualTo(1); // the data: image, never the remote one
    }
  }

  @Test
  void aBrandFontCanBePluggedIn() throws IOException {
    var renderer =
        new PdfBoxDocumentRenderer(
            () -> PDDocument.class.getResourceAsStream(PdfBoxDocumentRenderer.DEFAULT_FONT),
            () -> PDDocument.class.getResourceAsStream(PdfBoxDocumentRenderer.DEFAULT_FONT));
    byte[] pdf = renderer.render("<p>Plain <b>bold</b></p>");
    try (PDDocument doc = Loader.loadPDF(pdf)) {
      assertThat(new PDFTextStripper().getText(doc)).contains("Plain bold");
    }
  }
}
