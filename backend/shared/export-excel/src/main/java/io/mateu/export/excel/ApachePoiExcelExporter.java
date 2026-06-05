package io.mateu.export.excel;

import io.mateu.uidl.data.ExportColumn;
import io.mateu.uidl.interfaces.ExcelExporter;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.Field;
import java.util.List;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@Named
@Singleton
public class ApachePoiExcelExporter implements ExcelExporter {

  @Override
  public byte[] export(List<?> rows, List<ExportColumn> columns, HttpRequest httpRequest)
      throws Exception {
    try (var workbook = new XSSFWorkbook();
        var out = new ByteArrayOutputStream()) {

      var sheet = workbook.createSheet("Export");

      var headerStyle = workbook.createCellStyle();
      var headerFont = workbook.createFont();
      headerFont.setBold(true);
      headerStyle.setFont(headerFont);
      headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
      headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

      var headerRow = sheet.createRow(0);
      for (int i = 0; i < columns.size(); i++) {
        var cell = headerRow.createCell(i);
        cell.setCellValue(columns.get(i).label());
        cell.setCellStyle(headerStyle);
      }

      for (int r = 0; r < rows.size(); r++) {
        var row = sheet.createRow(r + 1);
        var dataRow = rows.get(r);
        for (int c = 0; c < columns.size(); c++) {
          var cell = row.createCell(c);
          try {
            Field field = dataRow.getClass().getDeclaredField(columns.get(c).id());
            field.setAccessible(true);
            Object value = field.get(dataRow);
            if (value != null) {
              cell.setCellValue(value.toString());
            }
          } catch (Exception ignored) {
          }
        }
      }

      for (int i = 0; i < columns.size(); i++) {
        sheet.autoSizeColumn(i);
      }

      workbook.write(out);
      return out.toByteArray();
    }
  }
}
