package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

/**
 * A planning board / tape chart: one row per {@link PlanningResource}, one column per day between
 * {@code from} and {@code to}, and colored {@link PlanningBlock}s spanning their date ranges on
 * their resource's row — the rooms × days grid every hotel/rental/staffing back-office needs.
 *
 * <p>When {@code selectActionId} is set, clicking a block runs that action with the block's id in
 * {@code parameters._blockId}. When {@code moveActionId} is set, blocks can be dragged to another
 * row/day; dropping runs the action with {@code parameters._blockId}, {@code _resourceId} (the
 * target row), {@code _start} and {@code _end} (the new ISO dates, same duration).
 */
@Builder
public record PlanningBoard(
    String id,
    List<PlanningResource> resources,
    List<PlanningBlock> blocks,
    LocalDate from,
    LocalDate to,
    String moveActionId,
    String selectActionId,
    String style,
    String cssClasses,
    /**
     * Headers of the attribute columns shown next to each resource's label (e.g. "Type", "Status");
     * each resource carries its values in {@link PlanningResource#attributes()}.
     */
    List<String> attributeColumns,
    /**
     * Action run when a block's start or end edge is dragged: parameters {@code _blockId,
     * _resourceId, _start, _end} (ISO dates, end inclusive like the block). Null = not resizable.
     */
    String resizeActionId,
    /** Action run on double click on a block: parameter {@code _blockId}. */
    String openActionId,
    /**
     * Action run when the user drags across EMPTY cells of a resource: parameters {@code
     * _resourceId, _start, _end} (the selected days, end inclusive). Null = no range selection.
     */
    String rangeSelectActionId)
    implements Component {

  public PlanningBoard(
      String id,
      List<PlanningResource> resources,
      List<PlanningBlock> blocks,
      LocalDate from,
      LocalDate to,
      String moveActionId,
      String selectActionId,
      String style,
      String cssClasses) {
    this(
        id,
        resources,
        blocks,
        from,
        to,
        moveActionId,
        selectActionId,
        style,
        cssClasses,
        null,
        null,
        null,
        null);
  }
}
