package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ExportColumn;
import java.util.List;

/**
 * Implemented (typically as a bean) to render a listing's rows as an Excel workbook for download.
 * {@link #export(List, List, HttpRequest)} receives the {@code rows} and the visible {@link
 * ExportColumn}s and returns the spreadsheet file content.
 */
public interface ExcelExporter {
  byte[] export(List<?> rows, List<ExportColumn> columns, HttpRequest httpRequest) throws Exception;
}
