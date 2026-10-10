package io.mateu.mdd.demoadminpanel.infra.in.ui.documents;

import io.mateu.uidl.data.PageSetup;
import io.mateu.uidl.interfaces.DocumentRenderer;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.stereotype.Component;

/**
 * The demo's own {@link DocumentRenderer}: Mateu ships no document renderer, the application
 * implements the port with the library it chooses — here Apache PDFBox. Deliberately tiny: it reads
 * the few tags the demo's invoice uses ({@code h1}, {@code p}, {@code br}, {@code tr/td/th}, {@code
 * hr}), lays them out on A4/Letter pages and draws the running header and footer of the {@link
 * PageSetup}. A real application would use a proper engine (see the docs).
 */
@Component
public class DemoPdfRenderer implements DocumentRenderer {

  private static final String FONT = "/org/apache/pdfbox/resources/ttf/LiberationSans-Regular.ttf";
  private static final Pattern BLOCK =
      Pattern.compile("<hr\\b[^>]*>|<(h1|p|tr)\\b[^>]*>(.*?)</\\1>", Pattern.DOTALL);
  private static final Pattern CELL = Pattern.compile("<t[dh]\\b[^>]*>(.*?)</t[dh]>", Pattern.DOTALL);

  /** A line to draw: a heading, a paragraph line, a table row, or a rule. */
  private record Line(String kind, List<String> cells) {}

  @Override
  public byte[] render(String html, PageSetup setup) {
    var effective = setup == null ? PageSetup.a4() : setup;
    var paper = effective.paper();
    var size =
        effective.landscape()
            ? new PDRectangle(paper.heightPt(), paper.widthPt())
            : new PDRectangle(paper.widthPt(), paper.heightPt());
    float margin = effective.marginMm() * 72f / 25.4f;
    try (var pdf = new PDDocument();
        var out = new ByteArrayOutputStream();
        var fontStream = PDDocument.class.getResourceAsStream(FONT)) {
      PDFont font = PDType0Font.load(pdf, fontStream, true); // embedded subset
      if (effective.title() != null) {
        pdf.getDocumentInformation().setTitle(effective.title());
      }
      PDPageContentStream cs = null;
      float y = 0;
      for (Line line : lines(html)) {
        float height = line.kind().equals("h1") ? 30 : 16;
        if (cs == null || y - height < margin) {
          if (cs != null) {
            cs.close();
          }
          var page = new PDPage(size);
          pdf.addPage(page);
          cs = new PDPageContentStream(pdf, page);
          y = size.getHeight() - margin;
        }
        y -= height;
        float width = size.getWidth() - 2 * margin;
        switch (line.kind()) {
          case "h1" -> text(cs, font, 20, margin, y, line.cells().get(0));
          case "hr" -> {
            cs.moveTo(margin, y + 8);
            cs.lineTo(margin + width, y + 8);
            cs.stroke();
          }
          case "tr" -> {
            var cells = line.cells();
            // first column wide (a concept), the last right-aligned (an amount), the rest between
            float rest = cells.size() > 2 ? width * 0.4f / (cells.size() - 1) : width / 2;
            for (int i = 0; i < cells.size(); i++) {
              boolean last = i == cells.size() - 1 && cells.size() > 1;
              float x = i == 0 ? margin : margin + width * 0.6f + (i - 1) * rest;
              if (last) {
                x = margin + width - font.getStringWidth(cells.get(i)) / 1000f * 10;
              }
              text(cs, font, 10, x, y, cells.get(i));
            }
          }
          default -> text(cs, font, 11, margin, y, line.cells().get(0));
        }
      }
      if (cs == null) {
        pdf.addPage(new PDPage(size));
      } else {
        cs.close();
      }
      decorate(pdf, font, effective, margin);
      pdf.save(out);
      return out.toByteArray();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static List<Line> lines(String html) {
    List<Line> lines = new ArrayList<>();
    Matcher m = BLOCK.matcher(html == null ? "" : html);
    while (m.find()) {
      String tag = m.group(1);
      if (tag == null) {
        lines.add(new Line("hr", List.of()));
      } else if (tag.equals("tr")) {
        List<String> cells = new ArrayList<>();
        Matcher c = CELL.matcher(m.group(2));
        while (c.find()) {
          cells.add(plain(c.group(1)));
        }
        lines.add(new Line("tr", cells));
      } else {
        for (String part : m.group(2).split("(?i)<br\\s*/?>")) {
          lines.add(new Line(tag, List.of(plain(part))));
        }
      }
    }
    return lines;
  }

  private static String plain(String fragment) {
    return fragment
        .replaceAll("<[^>]+>", "")
        .replace("&nbsp;", " ")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&amp;", "&")
        .replaceAll("\\s+", " ")
        .strip();
  }

  /** The running header and footer, once the page count is known. */
  private static void decorate(PDDocument pdf, PDFont font, PageSetup setup, float margin)
      throws IOException {
    int pages = pdf.getNumberOfPages();
    for (int i = 0; i < pages; i++) {
      var page = pdf.getPage(i);
      var box = page.getMediaBox();
      try (var cs =
          new PDPageContentStream(pdf, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
        band(cs, font, setup, setup.header(), i + 1, pages, box, margin, box.getHeight() - margin / 2);
        band(cs, font, setup, setup.footer(), i + 1, pages, box, margin, margin / 2);
      }
    }
  }

  private static void band(
      PDPageContentStream cs,
      PDFont font,
      PageSetup setup,
      String template,
      int page,
      int pages,
      PDRectangle box,
      float margin,
      float y)
      throws IOException {
    if (template == null) {
      return;
    }
    String[] parts =
        template
            .replace("{page}", String.valueOf(page))
            .replace("{pages}", String.valueOf(pages))
            .replace("{title}", setup.title() == null ? "" : setup.title())
            .split("\\|", -1);
    float width = box.getWidth() - 2 * margin;
    for (int i = 0; i < Math.min(3, parts.length); i++) {
      String part = parts[i].strip();
      if (part.isEmpty()) {
        continue;
      }
      float w = font.getStringWidth(part) / 1000f * 8.5f;
      float x = i == 0 ? margin : i == 1 ? margin + (width - w) / 2 : margin + width - w;
      text(cs, font, 8.5f, x, y, part);
    }
  }

  private static void text(
      PDPageContentStream cs, PDFont font, float size, float x, float y, String value)
      throws IOException {
    cs.beginText();
    cs.setFont(font, size);
    cs.newLineAtOffset(x, y);
    cs.showText(value);
    cs.endText();
  }
}
