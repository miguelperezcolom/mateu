package io.mateu.explorer.examples.behaviour.export;

import io.mateu.uidl.data.ExportFormat;
import io.mateu.uidl.data.ExportedFile;
import io.mateu.uidl.data.ListingExport;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingExporter;
import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Component;

/**
 * The app's Excel exporter — Mateu ships UI only, so writing the file is the app's. A real app would
 * use Apache POI; this one writes Excel's XML Spreadsheet format (opens in Excel and LibreOffice)
 * with no dependency at all. Being a bean is what makes the Export Excel button appear.
 */
@Component
public class SpreadsheetExporter implements ListingExporter {

  @Override
  public ExportFormat format() {
    return ExportFormat.excel;
  }

  @Override
  public ExportedFile export(ListingExport export, HttpRequest httpRequest) {
    var xml = new StringBuilder();
    xml.append("<?xml version=\"1.0\"?>\n<?mso-application progid=\"Excel.Sheet\"?>\n")
        .append("<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"")
        .append(" xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\">\n")
        .append("<Worksheet ss:Name=\"Export\"><Table>\n<Row>");
    for (var column : export.columns()) {
      xml.append(cell(column.label()));
    }
    xml.append("</Row>\n");
    for (var row : export.rows()) {
      xml.append("<Row>");
      for (var column : export.columns()) {
        xml.append(cell(column.textOf(row)));
      }
      xml.append("</Row>\n");
    }
    xml.append("</Table></Worksheet></Workbook>\n");
    return new ExportedFile(
        xml.toString().getBytes(StandardCharsets.UTF_8), "application/vnd.ms-excel", "orders.xls");
  }

  private static String cell(String text) {
    var escaped =
        (text == null ? "" : text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    return "<Cell><Data ss:Type=\"String\">" + escaped + "</Data></Cell>";
  }
}
