package io.mateu.core.infra.declarative.orchestrators.importwizard;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.core.infra.reflection.read.TypeCoercionHelper;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;

/**
 * Builds typed rows from parsed CSV records per the {@link ColumnMapping}s: coerces each cell into
 * the target field (basics via {@link TypeCoercionHelper}: String/int/long/double/boolean/enum/ISO
 * dates), collects conversion failures, then applies a minimal reflective pass over the jakarta
 * constraints ({@code @NotNull}/{@code @NotEmpty}/{@code @NotBlank}/{@code @Min}/{@code @Max}) —
 * core maps bean validation to client-side rules but runs no jakarta {@code Validator} server-side,
 * so the import validates the same annotations reflectively.
 */
final class ImportRowAssembler {

  /** The outcome of assembling every data row: the valid typed rows plus the per-line issues. */
  record Preview<Row>(List<Row> validRows, List<RowIssue> issues, int invalidRowCount) {}

  /** The row-class fields a CSV column can pour into (writable basics, enums and ISO temporals). */
  static List<Field> assignableFields(Class<?> rowClass) {
    return getAllFields(rowClass).stream()
        .filter(
            field ->
                !Modifier.isStatic(field.getModifiers()) && !Modifier.isFinal(field.getModifiers()))
        .filter(field -> isCoercible(field.getType()))
        .toList();
  }

  private static boolean isCoercible(Class<?> type) {
    return String.class.equals(type)
        || type.isPrimitive()
        || Integer.class.equals(type)
        || Long.class.equals(type)
        || Double.class.equals(type)
        || Float.class.equals(type)
        || Boolean.class.equals(type)
        || BigDecimal.class.equals(type)
        || LocalDate.class.equals(type)
        || LocalDateTime.class.equals(type)
        || LocalTime.class.equals(type)
        || type.isEnum();
  }

  @SneakyThrows
  static <Row> Preview<Row> assemble(
      Class<Row> rowClass, List<List<String>> records, List<ColumnMapping> mappings) {
    var validRows = new ArrayList<Row>();
    var issues = new ArrayList<RowIssue>();
    int invalidRowCount = 0;
    if (records.size() < 2 || mappings == null || mappings.isEmpty()) {
      return new Preview<>(validRows, issues, invalidRowCount);
    }
    var header = records.get(0);
    for (int r = 1; r < records.size(); r++) {
      int line = r + 1; // 1-based, counting the header line
      var record = records.get(r);
      var rowIssues = new ArrayList<RowIssue>();
      Row row = rowClass.getDeclaredConstructor().newInstance();
      for (var mapping : mappings) {
        if (mapping.targetField == null || mapping.targetField.isBlank()) {
          continue;
        }
        int index = header.indexOf(mapping.csvColumn);
        if (index < 0 || index >= record.size()) {
          continue;
        }
        var raw = record.get(index);
        if (raw == null || raw.isBlank()) {
          continue; // leave the field default; requiredness is caught by the constraint pass
        }
        var field = fieldByName(rowClass, mapping.targetField);
        if (field == null) {
          rowIssues.add(
              new RowIssue(line, mapping.csvColumn, mapping.targetField, "Unknown target field"));
          continue;
        }
        try {
          setValue(
              field,
              row,
              TypeCoercionHelper.getActualValue(field.getType(), raw.trim(), null, null));
        } catch (Exception e) {
          rowIssues.add(
              new RowIssue(
                  line,
                  mapping.csvColumn,
                  raw,
                  "Cannot convert to " + field.getType().getSimpleName()));
        }
      }
      rowIssues.addAll(validateConstraints(rowClass, row, line, mappings));
      if (rowIssues.isEmpty()) {
        validRows.add(row);
      } else {
        invalidRowCount++;
        issues.addAll(rowIssues);
      }
    }
    return new Preview<>(validRows, issues, invalidRowCount);
  }

  private static Field fieldByName(Class<?> rowClass, String name) {
    return getAllFields(rowClass).stream()
        .filter(field -> field.getName().equals(name))
        .findFirst()
        .orElse(null);
  }

  /** Minimal reflective evaluation of @NotNull/@NotEmpty/@NotBlank/@Min/@Max on the built row. */
  private static List<RowIssue> validateConstraints(
      Class<?> rowClass, Object row, int line, List<ColumnMapping> mappings) {
    var issues = new ArrayList<RowIssue>();
    for (var field : assignableFields(rowClass)) {
      var value = getValue(field, row);
      var column = columnFor(field.getName(), mappings);
      if (MetaAnnotations.isPresent(field, NotNull.class) && value == null) {
        issues.add(new RowIssue(line, column, "", "Must not be null"));
      }
      if (MetaAnnotations.isPresent(field, NotEmpty.class)
          && (value == null || String.valueOf(value).isEmpty())) {
        issues.add(new RowIssue(line, column, "", "Must not be empty"));
      }
      if (MetaAnnotations.isPresent(field, NotBlank.class)
          && (value == null || String.valueOf(value).isBlank())) {
        issues.add(new RowIssue(line, column, "", "Must not be blank"));
      }
      if (value instanceof Number number) {
        if (MetaAnnotations.isPresent(field, Min.class)
            && number.longValue() < MetaAnnotations.find(field, Min.class).value()) {
          issues.add(
              new RowIssue(
                  line,
                  column,
                  String.valueOf(value),
                  "Must be at least " + MetaAnnotations.find(field, Min.class).value()));
        }
        if (MetaAnnotations.isPresent(field, Max.class)
            && number.longValue() > MetaAnnotations.find(field, Max.class).value()) {
          issues.add(
              new RowIssue(
                  line,
                  column,
                  String.valueOf(value),
                  "Must be at most " + MetaAnnotations.find(field, Max.class).value()));
        }
      }
    }
    return issues;
  }

  /** The CSV column mapped onto the field (for issue reporting), or the field name itself. */
  private static String columnFor(String fieldName, List<ColumnMapping> mappings) {
    return mappings.stream()
        .filter(mapping -> fieldName.equals(mapping.targetField))
        .map(mapping -> mapping.csvColumn)
        .findFirst()
        .orElse(fieldName);
  }

  private ImportRowAssembler() {}
}
