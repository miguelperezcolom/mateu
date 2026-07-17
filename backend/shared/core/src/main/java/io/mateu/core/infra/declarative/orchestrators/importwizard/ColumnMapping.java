package io.mateu.core.infra.declarative.orchestrators.importwizard;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;

/**
 * One row of the {@link MappingStep} grid: a CSV column, a sample value from the first data row,
 * and the target row-class field it pours into ({@code targetField} is the only editable cell — an
 * inline select whose options are the row class's assignable field names; blank = skip the column).
 */
public class ColumnMapping {

  @ReadOnly
  @Label("CSV column")
  public String csvColumn;

  @ReadOnly
  @Label("Sample")
  public String sample;

  @Label("Target field")
  public String targetField;

  public ColumnMapping() {}

  public ColumnMapping(String csvColumn, String sample, String targetField) {
    this.csvColumn = csvColumn;
    this.sample = sample;
    this.targetField = targetField;
  }
}
