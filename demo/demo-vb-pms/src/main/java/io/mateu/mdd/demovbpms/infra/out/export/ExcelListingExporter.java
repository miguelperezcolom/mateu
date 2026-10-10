package io.mateu.mdd.demovbpms.infra.out.export;

import io.mateu.uidl.data.ExportFormat;
import io.mateu.uidl.data.ExportedFile;
import io.mateu.uidl.data.ListingExport;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingExporter;
import java.io.ByteArrayOutputStream;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.util.WorkbookUtil;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

/**
 * The application's Excel engine behind the listings' "Export Excel" button. Mateu ships the button,
 * the columns and the rows — and only the {@link ListingExporter} port for writing the file — so the
 * spreadsheet library (Apache POI here) is this app's choice and dependency.
 */
@Component
public class ExcelListingExporter implements ListingExporter {

  @Override
  public ExportFormat format() {
    return ExportFormat.excel;
  }

  @Override
  public ExportedFile export(ListingExport export, HttpRequest httpRequest) throws Exception {
    try (var workbook = new XSSFWorkbook();
        var out = new ByteArrayOutputStream()) {
      var sheet = workbook.createSheet(
              WorkbookUtil.createSafeSheetName(
                  export.title() != null ? export.title() : "Export"));

      var headerStyle = workbook.createCellStyle();
      var headerFont = workbook.createFont();
      headerFont.setBold(true);
      headerStyle.setFont(headerFont);
      headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
      headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

      var columns = export.columns();
      var header = sheet.createRow(0);
      for (int c = 0; c < columns.size(); c++) {
        var cell = header.createCell(c);
        cell.setCellValue(columns.get(c).label());
        cell.setCellStyle(headerStyle);
      }

      for (int r = 0; r < export.rows().size(); r++) {
        var row = sheet.createRow(r + 1);
        var item = export.rows().get(r);
        for (int c = 0; c < columns.size(); c++) {
          var value = columns.get(c).valueOf(item);
          var cell = row.createCell(c);
          // numbers stay numbers (sortable, summable); everything else is text
          if (value instanceof Number number && !(value instanceof java.math.BigInteger)) {
            cell.setCellValue(number.doubleValue());
          } else if (value instanceof Boolean bool) {
            cell.setCellValue(bool);
          } else if (value != null) {
            cell.setCellValue(value.toString());
          }
        }
      }
      for (int c = 0; c < columns.size(); c++) {
        sheet.autoSizeColumn(c);
      }

      workbook.write(out);
      var filename = (export.title() != null ? export.title() : "export") + ".xlsx";
      return new ExportedFile(out.toByteArray(), null, filename);
    }
  }
}
