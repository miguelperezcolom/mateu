package io.mateu.core.infra;

import io.mateu.uidl.data.ExportFormat;
import io.mateu.uidl.data.ExportedFile;
import io.mateu.uidl.data.ListingExport;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingExporter;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.nio.charset.StandardCharsets;

/**
 * Core's dependency-free CSV writer (RFC 4180 quoting, UTF-8, {@code \n} line ends) — the one
 * export format that needs no third-party engine. An application {@link ListingExporter} for {@link
 * ExportFormat#csv} replaces it.
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

  private String escapeCsv(String value) {
    if (value == null) return "";
    if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
      return "\"" + value.replace("\"", "\"\"") + "\"";
    }
    return value;
  }
}
