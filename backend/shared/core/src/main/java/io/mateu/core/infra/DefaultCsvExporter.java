package io.mateu.core.infra;

import io.mateu.uidl.data.ExportFormat;
import io.mateu.uidl.data.ExportedFile;
import io.mateu.uidl.data.ListingExport;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingExporter;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.nio.charset.StandardCharsets;
import java.util.function.Predicate;
import java.util.regex.Pattern;

/**
 * Core's dependency-free CSV writer (RFC 4180 quoting, UTF-8, {@code \n} line ends, formulas
 * neutralised) — the one export format that needs no third-party engine. An application {@link
 * ListingExporter} for {@link ExportFormat#csv} replaces it.
 */
@Named
@Singleton
public class DefaultCsvExporter implements ListingExporter {

  @Override
  public ExportFormat format() {
    return ExportFormat.csv;
  }

  @Override
  public ExportedFile export(ListingExport export, HttpRequest httpRequest) {
    var columns = export.columns();
    var sb = new StringBuilder();
    sb.append(String.join(",", columns.stream().map(col -> escapeCsv(col.label())).toList()));
    sb.append("\n");
    for (var row : export.rows()) {
      sb.append(String.join(",", columns.stream().map(col -> escapeCsv(col.textOf(row))).toList()));
      sb.append("\n");
    }
    return ExportedFile.of(sb.toString().getBytes(StandardCharsets.UTF_8));
  }

  private String escapeCsv(String raw) {
    if (raw == null) return "";
    var value = neutralized(raw);
    if (value.contains(",")
        || value.contains("\"")
        || value.contains("\n")
        || value.contains("\r")) {
      return "\"" + value.replace("\"", "\"\"") + "\"";
    }
    return value;
  }

  /**
   * A value a spreadsheet would run as a formula, prefixed with {@code '} so it stays text: the
   * cells come from whatever users typed, and the file is opened by somebody else. A plain number
   * ({@code -12.5}, {@code +34}) is left alone: it is data, and it has to stay a number.
   */
  private static String neutralized(String value) {
    if (value.isEmpty() || "=+-@\t\r".indexOf(value.charAt(0)) < 0 || PLAIN_NUMBER.test(value)) {
      return value;
    }
    return "'" + value;
  }

  private static final Predicate<String> PLAIN_NUMBER =
      Pattern.compile("[+-]?\\d+([.,]\\d+)?").asMatchPredicate();
}
