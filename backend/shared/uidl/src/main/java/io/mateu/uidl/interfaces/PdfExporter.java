package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ExportColumn;
import java.util.List;

/**
 * Renders a listing's rows to a PDF document. Implement {@link #export(List, List, HttpRequest)} to
 * produce the raw PDF bytes for the given {@code rows} and the {@link ExportColumn} definitions
 * (which columns and headers to include); used to back a PDF export action on a grid/listing.
 */
public interface PdfExporter {
  byte[] export(List<?> rows, List<ExportColumn> columns, HttpRequest httpRequest) throws Exception;
}
