package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ExportFormat;
import io.mateu.uidl.data.ExportedFile;
import io.mateu.uidl.data.ListingExport;

/**
 * The port that WRITES a listing export file. Mateu ships the UI of exporting — the Export buttons,
 * which columns, rows and filters are exported, and delivering the file to the user — but <b>no
 * spreadsheet or PDF engine</b>: the application implements this interface with the library of its
 * choice and registers it as a bean (Spring {@code @Component}, CDI / Micronaut {@code @Singleton},
 * …), one per {@link ExportFormat}.
 *
 * <p>A listing's Excel / PDF button ({@code excelExportable()} / {@code pdfExportable()}) is shown
 * only while an exporter for that format is registered — without one the button is not offered. CSV
 * is the one exception: core carries a dependency-free CSV writer, which an application exporter
 * for {@link ExportFormat#csv} replaces.
 *
 * <pre>{@code
 * @Component
 * class ExcelListingExporter implements ListingExporter {
 *   public ExportFormat format() { return ExportFormat.excel; }
 *
 *   public ExportedFile export(ListingExport export, HttpRequest httpRequest) throws Exception {
 *     try (var workbook = new XSSFWorkbook(); var out = new ByteArrayOutputStream()) {
 *       var sheet = workbook.createSheet("Export");
 *       var header = sheet.createRow(0);
 *       for (int c = 0; c < export.columns().size(); c++)
 *         header.createCell(c).setCellValue(export.columns().get(c).label());
 *       for (int r = 0; r < export.rows().size(); r++) {
 *         var row = sheet.createRow(r + 1);
 *         for (int c = 0; c < export.columns().size(); c++)
 *           row.createCell(c).setCellValue(export.columns().get(c).textOf(export.rows().get(r)));
 *       }
 *       workbook.write(out);
 *       return ExportedFile.of(out.toByteArray());
 *     }
 *   }
 * }
 * }</pre>
 */
public interface ListingExporter {

  /** The format this exporter writes. */
  ExportFormat format();

  /**
   * Writes the export file.
   *
   * @param export the format, title, columns, rows and search Mateu decided on
   * @param httpRequest the request that pressed the button (identity, locale…)
   * @return the file to download; a null media type / filename takes the format's default
   * @throws Exception an IO / format failure — reported to the user as an unexpected error
   */
  ExportedFile export(ListingExport export, HttpRequest httpRequest) throws Exception;
}
