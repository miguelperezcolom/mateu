package io.mateu.documents;

import io.mateu.documents.HtmlBlocks.Block;
import io.mateu.documents.HtmlBlocks.Cell;
import io.mateu.documents.HtmlBlocks.Image;
import io.mateu.documents.HtmlBlocks.PageBreak;
import io.mateu.documents.HtmlBlocks.Para;
import io.mateu.documents.HtmlBlocks.Row;
import io.mateu.documents.HtmlBlocks.Rule;
import io.mateu.documents.HtmlBlocks.Run;
import io.mateu.documents.HtmlBlocks.Table;
import io.mateu.uidl.data.PageSetup;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.graphics.state.RenderingMode;
import org.apache.pdfbox.util.Matrix;

/** Lays {@link HtmlBlocks} out on PDF pages, then draws the running header and footer. */
final class PdfLayout {

  private static final float CELL_PAD = 4f;
  private static final float TABLE_TEXT = 9.5f;
  private static final float LEADING = 1.3f;

  private final PDDocument pdf;
  private final PageSetup setup;
  private final PDFont regular;
  private final PDFont bold;
  private final boolean fakeBold;
  private final float pageWidth;
  private final float pageHeight;
  private final float margin;
  private final List<PDPage> pages = new ArrayList<>();
  private final Map<PDFont, Map<Integer, Boolean>> glyphs = new HashMap<>();

  private PDPageContentStream cs;
  private float y;

  PdfLayout(PDDocument pdf, PageSetup setup, PDFont regular, PDFont bold) {
    this.pdf = pdf;
    this.setup = setup;
    this.regular = regular;
    this.bold = bold == null ? regular : bold;
    this.fakeBold = bold == null;
    float w = setup.paper().widthPt();
    float h = setup.paper().heightPt();
    this.pageWidth = setup.landscape() ? h : w;
    this.pageHeight = setup.landscape() ? w : h;
    this.margin = setup.marginMm() * 72f / 25.4f;
  }

  void lay(List<Block> blocks) throws IOException {
    newPage();
    for (Block block : blocks) {
      switch (block) {
        case Para p -> paragraph(p);
        case Rule r -> rule();
        case PageBreak b -> {
          if (y < top()) {
            newPage();
          }
        }
        case Table t -> table(t);
        case Image i -> image(i);
      }
    }
    cs.close();
    decorate();
  }

  // ── geometry ───────────────────────────────────────────────────────────────────────────────

  private float top() {
    return pageHeight - margin;
  }

  private float bottom() {
    return margin;
  }

  private float contentWidth() {
    return pageWidth - 2 * margin;
  }

  private void newPage() throws IOException {
    if (cs != null) {
      cs.close();
    }
    var page = new PDPage(new PDRectangle(pageWidth, pageHeight));
    pdf.addPage(page);
    pages.add(page);
    cs = new PDPageContentStream(pdf, page);
    y = top();
  }

  private void ensure(float height) throws IOException {
    if (y - height < bottom() && y < top()) {
      newPage();
    }
  }

  // ── paragraphs ─────────────────────────────────────────────────────────────────────────────

  /** A word (with the space that followed it) in one style. */
  private record Piece(String text, boolean bold, boolean italic, boolean newline) {}

  private List<Piece> pieces(List<Run> runs) {
    List<Piece> out = new ArrayList<>();
    for (Run run : runs) {
      if (run.text().equals("\n")) {
        out.add(new Piece("", false, false, true));
        continue;
      }
      String text = run.text().replace('\t', ' ').replace('\r', ' ');
      int start = 0;
      for (int i = 0; i <= text.length(); i++) {
        if (i == text.length() || text.charAt(i) == ' ') {
          int end = Math.min(text.length(), i + 1);
          if (end > start) {
            out.add(new Piece(text.substring(start, end), run.bold(), run.italic(), false));
          }
          start = end;
        }
      }
    }
    return out;
  }

  private List<List<Piece>> lines(List<Piece> pieces, float size, float width) throws IOException {
    List<List<Piece>> lines = new ArrayList<>();
    List<Piece> line = new ArrayList<>();
    float used = 0;
    for (Piece piece : pieces) {
      if (piece.newline()) {
        lines.add(line);
        line = new ArrayList<>();
        used = 0;
        continue;
      }
      float w = width(piece, size);
      if (used + width(trimEnd(piece), size) > width && !line.isEmpty()) {
        lines.add(line);
        line = new ArrayList<>();
        used = 0;
        if (piece.text().isBlank()) {
          continue;
        }
      }
      if (line.isEmpty() && piece.text().isBlank()) {
        continue;
      }
      // a word wider than the line: cut it where it overflows
      while (width(trimEnd(piece), size) > width && piece.text().length() > 1) {
        int cut = piece.text().length() - 1;
        while (cut > 1 && widthOf(piece.text().substring(0, cut), piece.bold(), size) > width) {
          cut--;
        }
        lines.add(
            List.of(
                new Piece(piece.text().substring(0, cut), piece.bold(), piece.italic(), false)));
        piece = new Piece(piece.text().substring(cut), piece.bold(), piece.italic(), false);
        w = width(piece, size);
      }
      line.add(piece);
      used += w;
    }
    if (!line.isEmpty()) {
      lines.add(line);
    }
    return lines;
  }

  private void paragraph(Para p) throws IOException {
    float x = margin + p.indent();
    float width = contentWidth() - p.indent();
    float leading = p.size() * LEADING;
    var lines = lines(pieces(p.runs()), p.size(), width);
    if (y < top()) {
      y -= p.before();
    }
    boolean first = true;
    for (var line : lines) {
      ensure(leading);
      float baseline = y - p.size();
      if (first && p.bullet() != null) {
        text(p.bullet(), margin + p.indent() - 12, baseline, p.size(), false, false);
      }
      drawLine(line, x, baseline, width, p.size(), p.align());
      y -= leading;
      first = false;
    }
    y -= p.after();
  }

  private void drawLine(
      List<Piece> line, float x, float baseline, float width, float size, String align)
      throws IOException {
    float total = 0;
    for (int i = 0; i < line.size(); i++) {
      total += width(i == line.size() - 1 ? trimEnd(line.get(i)) : line.get(i), size);
    }
    float cx =
        switch (align == null ? "left" : align) {
          case "right" -> x + width - total;
          case "center" -> x + (width - total) / 2;
          default -> x;
        };
    for (Piece piece : line) {
      text(piece.text(), cx, baseline, size, piece.bold(), piece.italic());
      cx += width(piece, size);
    }
  }

  private void rule() throws IOException {
    ensure(10);
    y -= 4;
    cs.setStrokingColor(0.6f, 0.6f, 0.6f);
    cs.setLineWidth(0.6f);
    cs.moveTo(margin, y);
    cs.lineTo(pageWidth - margin, y);
    cs.stroke();
    cs.setStrokingColor(0f, 0f, 0f);
    y -= 6;
  }

  // ── tables ─────────────────────────────────────────────────────────────────────────────────

  private void table(Table t) throws IOException {
    float width = contentWidth();
    List<Row> header = new ArrayList<>();
    for (Row row : t.rows()) {
      if (!row.header()) {
        break;
      }
      header.add(row);
    }
    y -= 4;
    boolean firstOnPage = true;
    for (Row row : t.rows()) {
      float height = rowHeight(row, t.widths(), width);
      if (y - height < bottom() && !firstOnPage) {
        newPage();
        if (!row.header()) {
          for (Row h : header) {
            drawRow(h, t.widths(), width, rowHeight(h, t.widths(), width));
          }
        }
      }
      drawRow(row, t.widths(), width, height);
      firstOnPage = false;
    }
    y -= 8;
  }

  private float rowHeight(Row row, float[] fractions, float width) throws IOException {
    float max = 0;
    int col = 0;
    for (Cell cell : row.cells()) {
      float cw = span(fractions, col, cell.colspan()) * width;
      int n = Math.max(1, lines(pieces(cell.runs()), TABLE_TEXT, cw - 2 * CELL_PAD).size());
      max = Math.max(max, n * TABLE_TEXT * LEADING);
      col += cell.colspan();
    }
    return max + 2 * CELL_PAD;
  }

  private void drawRow(Row row, float[] fractions, float width, float height) throws IOException {
    float x = margin;
    int col = 0;
    if (row.header()) {
      cs.setNonStrokingColor(0.92f, 0.92f, 0.92f);
      cs.addRect(margin, y - height, width, height);
      cs.fill();
      cs.setNonStrokingColor(0f, 0f, 0f);
    }
    for (Cell cell : row.cells()) {
      float cw = span(fractions, col, cell.colspan()) * width;
      cs.setStrokingColor(0.7f, 0.7f, 0.7f);
      cs.setLineWidth(0.5f);
      cs.addRect(x, y - height, cw, height);
      cs.stroke();
      // the synthesised bold strokes its glyphs: in the text colour, not the border's
      cs.setStrokingColor(0f, 0f, 0f);
      float baseline = y - CELL_PAD - TABLE_TEXT;
      for (var line : lines(pieces(cell.runs()), TABLE_TEXT, cw - 2 * CELL_PAD)) {
        drawLine(line, x + CELL_PAD, baseline, cw - 2 * CELL_PAD, TABLE_TEXT, cell.align());
        baseline -= TABLE_TEXT * LEADING;
      }
      x += cw;
      col += cell.colspan();
    }
    cs.setStrokingColor(0f, 0f, 0f);
    y -= height;
  }

  private static float span(float[] fractions, int from, int count) {
    float sum = 0;
    for (int i = from; i < Math.min(fractions.length, from + count); i++) {
      sum += fractions[i];
    }
    return sum;
  }

  // ── images ─────────────────────────────────────────────────────────────────────────────────

  private void image(Image i) throws IOException {
    PDImageXObject image;
    try {
      image = PDImageXObject.createFromByteArray(pdf, i.bytes(), "image");
    } catch (IOException | IllegalArgumentException e) {
      return; // not an image PDFBox can read: left out rather than failing the document
    }
    float w = i.widthPt() > 0 ? i.widthPt() : image.getWidth() * 0.75f;
    w = Math.min(w, contentWidth());
    float h = w * image.getHeight() / Math.max(1, image.getWidth());
    ensure(h + 4);
    y -= h;
    cs.drawImage(image, margin, y, w, h);
    y -= 6;
  }

  // ── text ───────────────────────────────────────────────────────────────────────────────────

  private PDFont font(boolean isBold) {
    return isBold ? bold : regular;
  }

  private void text(
      String value, float x, float baseline, float size, boolean isBold, boolean italic)
      throws IOException {
    String printable = printable(font(isBold), value);
    if (printable.isEmpty()) {
      return;
    }
    cs.beginText();
    cs.setFont(font(isBold), size);
    if (isBold && fakeBold) {
      cs.setRenderingMode(RenderingMode.FILL_STROKE);
      cs.setLineWidth(size * 0.035f);
    }
    cs.setTextMatrix(new Matrix(1, 0, italic ? 0.2f : 0, 1, x, baseline));
    cs.showText(printable);
    if (isBold && fakeBold) {
      cs.setRenderingMode(RenderingMode.FILL);
    }
    cs.endText();
  }

  private float width(Piece piece, float size) throws IOException {
    return widthOf(piece.text(), piece.bold(), size);
  }

  private float widthOf(String text, boolean isBold, float size) throws IOException {
    var font = font(isBold);
    float w = font.getStringWidth(printable(font, text)) / 1000f * size;
    return isBold && fakeBold ? w * 1.02f : w;
  }

  private static Piece trimEnd(Piece piece) {
    return new Piece(piece.text().stripTrailing(), piece.bold(), piece.italic(), piece.newline());
  }

  /** {@code text} with every character the font has no glyph for replaced by {@code ?}. */
  private String printable(PDFont font, String text) {
    var known = glyphs.computeIfAbsent(font, f -> new HashMap<>());
    StringBuilder out = new StringBuilder();
    text.codePoints()
        .forEach(
            cp -> {
              boolean ok =
                  known.computeIfAbsent(
                      cp,
                      c -> {
                        try {
                          font.encode(new String(Character.toChars(c)));
                          return true;
                        } catch (IOException | IllegalArgumentException e) {
                          return false;
                        }
                      });
              if (ok) {
                out.appendCodePoint(cp);
              } else if (!Character.isISOControl(cp)) {
                out.append('?');
              }
            });
    return out.toString();
  }

  // ── running header and footer ──────────────────────────────────────────────────────────────

  private void decorate() throws IOException {
    if (setup.header() == null && setup.footer() == null) {
      return;
    }
    int total = pages.size();
    for (int i = 0; i < total; i++) {
      try (var stream =
          new PDPageContentStream(
              pdf, pages.get(i), PDPageContentStream.AppendMode.APPEND, true, true)) {
        cs = stream;
        cs.setNonStrokingColor(0.35f, 0.35f, 0.35f);
        if (setup.header() != null) {
          band(setup.header(), i + 1, total, pageHeight - margin / 2);
        }
        if (setup.footer() != null) {
          band(setup.footer(), i + 1, total, margin / 2 - 3);
        }
      }
    }
  }

  private void band(String template, int page, int pages, float baseline) throws IOException {
    float size = 8.5f;
    String text =
        template
            .replace("{page}", String.valueOf(page))
            .replace("{pages}", String.valueOf(pages))
            .replace("{title}", setup.title() == null ? "" : setup.title());
    String[] parts = text.split("\\|", -1);
    String[] aligns = {"left", "center", "right"};
    for (int i = 0; i < Math.min(3, parts.length); i++) {
      String part = parts[i].strip();
      if (part.isEmpty()) {
        continue;
      }
      var piece = new Piece(part, false, false, false);
      drawLine(
          List.of(piece),
          margin,
          baseline,
          contentWidth(),
          size,
          parts.length == 1 ? "left" : aligns[i]);
    }
  }
}
