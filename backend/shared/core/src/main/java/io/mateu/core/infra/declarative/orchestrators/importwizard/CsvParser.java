package io.mateu.core.infra.declarative.orchestrators.importwizard;

import java.util.ArrayList;
import java.util.List;

/**
 * Minimal RFC-4180-ish CSV parser for the {@link ImportWizard}: quoted fields may embed the
 * separator, doubled quotes ({@code ""}) and newlines; rows end at {@code \n}, {@code \r\n} or
 * {@code \r}. Both {@code ,} and {@code ;} separate fields — the separator is detected by counting
 * the candidates (outside quotes) on the first line.
 */
public final class CsvParser {

  /** Parses the whole content into rows of cells; fully-blank lines are dropped. */
  public static List<List<String>> parse(String content) {
    if (content == null || content.isBlank()) {
      return List.of();
    }
    char separator = detectSeparator(content);
    var rows = new ArrayList<List<String>>();
    var row = new ArrayList<String>();
    var cell = new StringBuilder();
    boolean inQuotes = false;
    int i = 0;
    int length = content.length();
    while (i < length) {
      char c = content.charAt(i);
      if (inQuotes) {
        if (c == '"') {
          if (i + 1 < length && content.charAt(i + 1) == '"') {
            cell.append('"');
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        cell.append(c);
        i++;
        continue;
      }
      if (c == '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (c == separator) {
        row.add(cell.toString());
        cell.setLength(0);
        i++;
        continue;
      }
      if (c == '\r' || c == '\n') {
        row.add(cell.toString());
        cell.setLength(0);
        rows.add(row);
        row = new ArrayList<>();
        if (c == '\r' && i + 1 < length && content.charAt(i + 1) == '\n') {
          i++;
        }
        i++;
        continue;
      }
      cell.append(c);
      i++;
    }
    if (cell.length() > 0 || !row.isEmpty()) {
      row.add(cell.toString());
      rows.add(row);
    }
    rows.removeIf(cells -> cells.stream().allMatch(String::isBlank));
    return rows;
  }

  /**
   * The field separator, detected on the first line: {@code ;} when it outnumbers {@code ,} outside
   * quotes, else {@code ,}.
   */
  static char detectSeparator(String content) {
    int commas = 0;
    int semicolons = 0;
    boolean inQuotes = false;
    for (int i = 0; i < content.length(); i++) {
      char c = content.charAt(i);
      if (c == '"') {
        inQuotes = !inQuotes;
      } else if (!inQuotes) {
        if (c == '\r' || c == '\n') {
          break;
        }
        if (c == ',') {
          commas++;
        }
        if (c == ';') {
          semicolons++;
        }
      }
    }
    return semicolons > commas ? ';' : ',';
  }

  private CsvParser() {}
}
