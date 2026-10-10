package io.mateu.mdd.demovbpms.domain;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * A minimal one-page PDF writer (Helvetica, lines of text) so the demo can generate a real folio
 * PDF without a PDF library. Enough for the browser's viewer; not a document engine.
 */
public final class SimplePdf {

  private SimplePdf() {}

  public static byte[] of(String title, List<String> lines) {
    StringBuilder content = new StringBuilder("BT /F1 16 Tf 50 790 Td (" + esc(title) + ") Tj ET\n");
    int y = 760;
    for (String line : lines) {
      content.append("BT /F1 10 Tf 50 ").append(y).append(" Td (").append(esc(line)).append(") Tj ET\n");
      y -= 14;
      if (y < 40) break;
    }
    byte[] stream = content.toString().getBytes(StandardCharsets.ISO_8859_1);
    List<String> objects = new ArrayList<>();
    objects.add("<< /Type /Catalog /Pages 2 0 R >>");
    objects.add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    objects.add(
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>");
    objects.add("<< /Length " + stream.length + " >>\nstream\n" + content + "endstream");
    objects.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    List<Integer> offsets = new ArrayList<>();
    write(out, "%PDF-1.4\n");
    for (int i = 0; i < objects.size(); i++) {
      offsets.add(out.size());
      write(out, (i + 1) + " 0 obj\n" + objects.get(i) + "\nendobj\n");
    }
    int xref = out.size();
    StringBuilder x = new StringBuilder("xref\n0 " + (objects.size() + 1) + "\n0000000000 65535 f \n");
    for (int o : offsets) x.append(String.format("%010d 00000 n \n", o));
    x.append("trailer\n<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\nstartxref\n")
        .append(xref).append("\n%%EOF\n");
    write(out, x.toString());
    return out.toByteArray();
  }

  private static void write(ByteArrayOutputStream out, String s) {
    out.writeBytes(s.getBytes(StandardCharsets.ISO_8859_1));
  }

  private static String esc(String s) {
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
  }
}
