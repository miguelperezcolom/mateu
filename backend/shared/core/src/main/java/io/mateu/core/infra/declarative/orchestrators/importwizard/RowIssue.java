package io.mateu.core.infra.declarative.orchestrators.importwizard;

import io.mateu.uidl.annotations.Label;

/** One problem found while validating a CSV data row in the {@link ImportWizard}. */
public class RowIssue {

  @Label("Line")
  public int line;

  @Label("Column")
  public String column;

  @Label("Value")
  public String value;

  @Label("Problem")
  public String problem;

  public RowIssue() {}

  public RowIssue(int line, String column, String value, String problem) {
    this.line = line;
    this.column = column;
    this.value = value;
    this.problem = problem;
  }
}
