package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * A crud
 *
 * @param title The title
 * @param subtitle The subtitle
 * @param canEdit If records can be edited. This make the Edit button visible
 * @param searchable If list can be searched
 * @param columns The columns
 * @param actions The actions which can be run for this crud. They end up as buttons
 * @param child This crud is a child of another view. This makes the title smaller
 */
@Builder
public record CrudlDto(
    String title,
    String subtitle,
    boolean canEdit,
    boolean selectionListened,
    boolean hasActionOnSelectedRow,
    boolean multipleRowSelectionEnabled,
    boolean searchable,
    boolean showCards,
    List<FormFieldDto> filters,
    List<ColumnDto> columns,
    List<ActionDto> actions,
    List<TriggerDto> triggers,
    List<ButtonDto> toolbar,
    boolean child)
    implements ComponentMetadataDto {

  public CrudlDto {
    columns = Collections.unmodifiableList(columns != null ? columns : Collections.emptyList());
    actions = Collections.unmodifiableList(actions != null ? actions : Collections.emptyList());
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
