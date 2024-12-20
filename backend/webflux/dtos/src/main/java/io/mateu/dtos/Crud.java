package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A crud
 *
 * @param title The title
 * @param subtitle The subtitle
 * @param canEdit If records can be edited. This make the Edit button visible
 * @param searchable If list can be searched
 * @param searchForm The form for searching. It can include several filters
 * @param columns The columns
 * @param actions The actions which can be run for this crud. They end up as buttons
 * @param child This crud is a child of another view. This makes the title smaller
 */
public record Crud(
    String title,
    String subtitle,
    boolean canEdit,
    boolean selectionListened,
    boolean hasActionOnSelectedRow,
    boolean multipleRowSelectionEnabled,
    boolean searchable,
    boolean showCards,
    Component searchForm,
    List<Column> columns,
    List<Action> actions,
    boolean child)
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
