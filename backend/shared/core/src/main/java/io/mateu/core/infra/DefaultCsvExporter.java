package io.mateu.core.infra;

import io.mateu.uidl.data.ExportColumn;
import io.mateu.uidl.interfaces.CsvExporter;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Named
@Singleton
public class DefaultCsvExporter implements CsvExporter {

  @Override
  public byte[] export(List<?> rows, List<ExportColumn> columns, HttpRequest httpRequest)
      throws Exception {
    var sb = new StringBuilder();

    sb.append(String.join(",", columns.stream().map(col -> escapeCsv(col.label())).toList()));
    sb.append("\n");

    for (var row : rows) {
      sb.append(
          String.join(
              ",",
              columns.stream()
                  .map(
                      col -> {
                        try {
                          Field field = row.getClass().getDeclaredField(col.id());
                          field.setAccessible(true);
                          Object value = field.get(row);
                          return escapeCsv(value != null ? value.toString() : "");
                        } catch (Exception e) {
                          return "";
                        }
                      })
                  .toList()));
      sb.append("\n");
    }

    return sb.toString().getBytes(StandardCharsets.UTF_8);
  }

  private String escapeCsv(String value) {
    if (value == null) return "";
    if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
      return "\"" + value.replace("\"", "\"\"") + "\"";
    }
    return value;
  }
}
