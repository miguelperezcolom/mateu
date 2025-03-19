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
public record CrudDto(
    String title,
    String subtitle,
    boolean canEdit,
    boolean selectionListened,
    boolean hasActionOnSelectedRow,
    boolean multipleRowSelectionEnabled,
    boolean searchable,
    boolean showCards,
    ComponentDto searchForm,
    List<ColumnDto> columns,
    List<ActionDto> actions,
    boolean child)
    implements ComponentMetadataDto {

  public CrudDto {
    columns = Collections.unmodifiableList(columns);
    actions = Collections.unmodifiableList(actions);
  }

  @Override
  public List<ColumnDto> columns() {
    return Collections.unmodifiableList(columns);
  }

  @Override
  public List<ActionDto> actions() {
    return Collections.unmodifiableList(actions);
  }
}
