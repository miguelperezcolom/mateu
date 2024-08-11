package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record Crud(
    String dataPrefix,
    String listId,
    String title,
    String subtitle,
    boolean canEdit,
    SearchForm searchForm,
    List<Column> columns,
    List<Action> actions)
    implements ViewMetadata {

  public Crud {
    columns = Collections.unmodifiableList(columns);
    actions = Collections.unmodifiableList(actions);
  }

  @Override
  public List<Column> columns() {
    return Collections.unmodifiableList(columns);
  }

  @Override
  public List<Action> actions() {
    return Collections.unmodifiableList(actions);
  }
}
