package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ExportColumn;
import java.util.List;

public interface PdfExporter {
  byte[] export(List<?> rows, List<ExportColumn> columns, HttpRequest httpRequest) throws Exception;
}
