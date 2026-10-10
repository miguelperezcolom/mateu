package io.mateu.documents;

import io.mateu.uidl.data.PageSetup;
import io.mateu.uidl.interfaces.DocumentRenderer;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.function.Supplier;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;

/**
 * The {@link DocumentRenderer} of {@code io.mateu:mateu-documents}: HTML to PDF on Apache PDFBox
 * (Apache-2.0), the HTML read by jsoup (MIT) — no copyleft anywhere in the chain.
 *
 * <p>It is NOT a browser: it lays out a documented subset that covers business documents —
 * headings, paragraphs, line breaks, bold/italic, lists, tables (column widths in %, header rows
 * repeated on every page, {@code colspan}), {@code text-align}, horizontal rules, page breaks
 * ({@code page-break-before: always}) and {@code data:} images (PNG/JPEG; remote URLs are never
 * fetched). CSS beyond that is ignored. A4 or Letter, portrait or landscape, margins, a running
 * header and footer with page numbers — all from {@link PageSetup}.
 *
 * <p>Fonts are EMBEDDED (subset): Liberation Sans by default (shipped inside PDFBox, SIL OFL 1.1),
 * bold synthesised by stroking; pass your own TTFs to the constructor for a brand font or a real
 * bold face. A character the font lacks prints as {@code ?}.
 */
@Named
@Singleton
public class PdfBoxDocumentRenderer implements DocumentRenderer {

  static final String DEFAULT_FONT = "/org/apache/pdfbox/resources/ttf/LiberationSans-Regular.ttf";

  private final Supplier<InputStream> regularFont;
  private final Supplier<InputStream> boldFont;

  /** Liberation Sans, embedded. */
  public PdfBoxDocumentRenderer() {
    this(() -> PDDocument.class.getResourceAsStream(DEFAULT_FONT), null);
  }

  /**
   * Your own TrueType fonts, embedded as subsets.
   *
   * @param regularFont opens the regular face
   * @param boldFont opens the bold face, or null to synthesise bold from the regular one
   */
  public PdfBoxDocumentRenderer(Supplier<InputStream> regularFont, Supplier<InputStream> boldFont) {
    this.regularFont = regularFont;
    this.boldFont = boldFont;
  }

  @Override
  public byte[] render(String html, PageSetup setup) {
    var effective = setup == null ? PageSetup.a4() : setup;
    try (var pdf = new PDDocument();
        var out = new ByteArrayOutputStream()) {
      PDFont regular = load(pdf, regularFont);
      PDFont bold = boldFont == null ? null : load(pdf, boldFont);
      new PdfLayout(pdf, effective, regular, bold).lay(HtmlBlocks.read(html));
      var info = pdf.getDocumentInformation();
      if (effective.title() != null) {
        info.setTitle(effective.title());
      }
      info.setProducer("Mateu documents (Apache PDFBox)");
      pdf.save(out);
      return out.toByteArray();
    } catch (IOException e) {
      throw new UncheckedIOException("Rendering the document failed", e);
    }
  }

  private static PDFont load(PDDocument pdf, Supplier<InputStream> font) throws IOException {
    try (InputStream in = font.get()) {
      if (in == null) {
        throw new IOException("Font not found");
      }
      return PDType0Font.load(pdf, in, true);
    }
  }
}
