package io.mateu.export.pdf;

import io.mateu.uidl.data.ExportColumn;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PdfExporter;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.Field;
import java.util.List;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

@Named
@Singleton
public class PdfBoxPdfExporter implements PdfExporter {

  private static final float MARGIN = 40f;
  private static final float ROW_HEIGHT = 18f;
  private static final float FONT_SIZE = 9f;
  private static final float CELL_PADDING = 4f;

  // A4 landscape
  private static final PDRectangle PAGE_SIZE =
      new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth());

  @Override
  public byte[] export(List<?> rows, List<ExportColumn> columns, HttpRequest httpRequest)
      throws Exception {

    var regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    var bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

    try (var doc = new PDDocument();
        var out = new ByteArrayOutputStream()) {
      float tableWidth = PAGE_SIZE.getWidth() - 2 * MARGIN;
      float colWidth = columns.isEmpty() ? tableWidth : tableWidth / columns.size();

      PDPageContentStream cs = null;
      float y = 0;

      // Always render at least one page (even for empty exports)
      int total = rows.isEmpty() ? 0 : rows.size();
      for (int rowIdx = 0; rowIdx <= total; rowIdx++) {
        boolean isHeaderRow = rowIdx == 0 || y < MARGIN + ROW_HEIGHT;

        if (isHeaderRow) {
          if (cs != null) cs.close();
          var page = new PDPage(PAGE_SIZE);
          doc.addPage(page);
          cs = new PDPageContentStream(doc, page);
          y = PAGE_SIZE.getHeight() - MARGIN;

          // grey background
          cs.setNonStrokingColor(0.80f, 0.80f, 0.80f);
          cs.addRect(MARGIN, y - ROW_HEIGHT, tableWidth, ROW_HEIGHT);
          cs.fill();

          // header text
          cs.setNonStrokingColor(0f, 0f, 0f);
          for (int c = 0; c < columns.size(); c++) {
            String text = safe(columns.get(c).label());
            cs.beginText();
            cs.setFont(bold, FONT_SIZE);
            cs.newLineAtOffset(MARGIN + c * colWidth + CELL_PADDING, y - ROW_HEIGHT + CELL_PADDING);
            cs.showText(truncate(text, colWidth - 2 * CELL_PADDING, bold));
            cs.endText();
          }

          // header bottom border
          cs.setStrokingColor(0.5f, 0.5f, 0.5f);
          cs.setLineWidth(0.5f);
          drawHLine(cs, MARGIN, MARGIN + tableWidth, y - ROW_HEIGHT);

          y -= ROW_HEIGHT;
        }

        if (rowIdx >= total) break;

        // alternating background
        if (rowIdx % 2 == 0) {
          cs.setNonStrokingColor(0.96f, 0.96f, 0.96f);
          cs.addRect(MARGIN, y - ROW_HEIGHT, tableWidth, ROW_HEIGHT);
          cs.fill();
        }

        var dataRow = rows.get(rowIdx);
        cs.setNonStrokingColor(0f, 0f, 0f);
        for (int c = 0; c < columns.size(); c++) {
          String text = getCellText(dataRow, columns.get(c).id());
          cs.beginText();
          cs.setFont(regular, FONT_SIZE);
          cs.newLineAtOffset(MARGIN + c * colWidth + CELL_PADDING, y - ROW_HEIGHT + CELL_PADDING);
          cs.showText(truncate(text, colWidth - 2 * CELL_PADDING, regular));
          cs.endText();
        }

        // row divider
        cs.setStrokingColor(0.85f, 0.85f, 0.85f);
        cs.setLineWidth(0.3f);
        drawHLine(cs, MARGIN, MARGIN + tableWidth, y - ROW_HEIGHT);

        y -= ROW_HEIGHT;
      }

      if (cs != null) cs.close();
      doc.save(out);
      return out.toByteArray();
    }
  }

  private void drawHLine(PDPageContentStream cs, float x1, float x2, float y) throws Exception {
    cs.moveTo(x1, y);
    cs.lineTo(x2, y);
    cs.stroke();
  }

  private String getCellText(Object row, String fieldId) {
    try {
      Field field = row.getClass().getDeclaredField(fieldId);
      field.setAccessible(true);
      Object value = field.get(row);
      return value != null ? safe(value.toString()) : "";
    } catch (Exception e) {
      return "";
    }
  }

  /** Strip characters outside WinAnsiEncoding (standard Type1 fonts only support Latin-1). */
  private String safe(String text) {
    if (text == null) return "";
    var sb = new StringBuilder(text.length());
    for (char c : text.toCharArray()) {
      if ((c >= 32 && c <= 126) || (c >= 160 && c <= 255)) sb.append(c);
      else if (c > 126) sb.append('?');
    }
    return sb.toString();
  }

  private String truncate(String text, float maxWidth, PDType1Font font) {
    try {
      if (font.getStringWidth(text) / 1000f * FONT_SIZE <= maxWidth) return text;
      String result = text;
      while (!result.isEmpty()) {
        result = result.substring(0, result.length() - 1);
        if (font.getStringWidth(result + "...") / 1000f * FONT_SIZE <= maxWidth) {
          return result + "...";
        }
      }
    } catch (Exception ignored) {
    }
    return text;
  }
}
