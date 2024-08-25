package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A crud
 *
 * @param listId An id for this crud
 * @param title The title
 * @param subtitle The subtitle
 * @param canEdit If records can be edited. This make the Edit button visible
 * @param searchForm The form for searching. It can include several filters
 * @param columns The columns
 * @param actions The actions which can be run for this crud. They end up as buttons
 */
public record Crud(
    String listId,
    String title,
    String subtitle,
    boolean canEdit,
    SearchForm searchForm,
    List<Column> columns,
    List<Action> actions)
    implements ComponentMetadata {

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
