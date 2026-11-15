package io.mateu.demo.localtool;

import java.util.ArrayList;
import java.util.List;

/**
 * CSV (RFC 4180: quoted fields, doubled quotes, line breaks inside quotes; comma or semicolon) to a
 * JSON array of objects keyed by the header row. Small on purpose: the demo is about the tool, not
 * the parser.
 */
public final class Csv {

  private Csv() {}

  public static List<List<String>> parse(String text) {
    var separator = detectSeparator(text);
    var rows = new ArrayList<List<String>>();
    var row = new ArrayList<String>();
    var field = new StringBuilder();
    boolean quoted = false;
    for (int i = 0; i < text.length(); i++) {
      char c = text.charAt(i);
      if (quoted) {
        if (c == '"' && i + 1 < text.length() && text.charAt(i + 1) == '"') {
          field.append('"');
          i++;
        } else if (c == '"') {
          quoted = false;
        } else {
          field.append(c);
        }
      } else if (c == '"') {
        quoted = true;
      } else if (c == separator) {
        row.add(field.toString());
        field.setLength(0);
      } else if (c == '\n' || c == '\r') {
        if (c == '\r' && i + 1 < text.length() && text.charAt(i + 1) == '\n') {
          i++;
        }
        row.add(field.toString());
        field.setLength(0);
        addUnlessBlank(rows, row);
        row = new ArrayList<>();
      } else {
        field.append(c);
      }
    }
    row.add(field.toString());
    addUnlessBlank(rows, row);
    return rows;
  }

  public static String toJson(String csv) {
    var rows = parse(csv == null ? "" : csv);
    if (rows.isEmpty()) {
      return "[]";
    }
    var header = rows.get(0);
    var json = new StringBuilder("[");
    for (int r = 1; r < rows.size(); r++) {
      var row = rows.get(r);
      json.append(r == 1 ? "\n  {" : ",\n  {");
      for (int c = 0; c < header.size(); c++) {
        json.append(c == 0 ? "" : ", ")
            .append(quote(header.get(c).trim()))
            .append(": ")
            .append(quote(c < row.size() ? row.get(c) : ""));
      }
      json.append('}');
    }
    return json.append(rows.size() > 1 ? "\n]" : "]").toString();
  }

  static char detectSeparator(String text) {
    var firstLine = text.lines().findFirst().orElse("");
    return firstLine.chars().filter(ch -> ch == ';').count()
            > firstLine.chars().filter(ch -> ch == ',').count()
        ? ';'
        : ',';
  }

  private static void addUnlessBlank(List<List<String>> rows, List<String> row) {
    if (!(row.size() == 1 && row.get(0).isBlank())) {
      rows.add(row);
    }
  }

  static String quote(String s) {
    var out = new StringBuilder("\"");
    for (char c : s.toCharArray()) {
      switch (c) {
        case '"' -> out.append("\\\"");
        case '\\' -> out.append("\\\\");
        case '\n' -> out.append("\\n");
        case '\r' -> out.append("\\r");
        case '\t' -> out.append("\\t");
        default -> {
          if (c < 0x20) {
            out.append(String.format("\\u%04x", (int) c));
          } else {
            out.append(c);
          }
        }
      }
    }
    return out.append('"').toString();
  }
}
