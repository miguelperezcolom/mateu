package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ExportColumn;
import java.util.List;

/**
 * Implemented (typically as a bean) to render a listing's rows as CSV bytes for download. {@link
 * #export(List, List, HttpRequest)} receives the {@code rows} and the visible {@link ExportColumn}s
 * and returns the CSV file content.
 */
public interface CsvExporter {
  byte[] export(List<?> rows, List<ExportColumn> columns, HttpRequest httpRequest) throws Exception;
}
