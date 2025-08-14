package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * A crud column
 *
 * @param id The column targetId
 * @param dataType The column data dataType
 * @param stereotype The column stereotype. How this must be shown
 * @param header The column label
 * @param description A help text. Usually a tooltip
 * @param width The preferred width for this column
 * @param attributes Some extra column attributes/data
 * @param detail If this column is to be opened in the detail
 */
@Builder
public record ColumnDto(
    String id,
    String dataType,
    String stereotype,
    String header,
    String description,
    String width,
    List<PairDto> attributes,
    boolean detail,
    boolean sortable,
    boolean serverSideSortable,
    boolean filterable,
    boolean frozen,
    boolean frozenToEnd,
    boolean autoWidth,
    String flexGrow,
    boolean resizable) {

  public ColumnDto {
    attributes =
        Collections.unmodifiableList(attributes != null ? attributes : Collections.emptyList());
  }

  @Override
  public List<PairDto> attributes() {
    return Collections.unmodifiableList(attributes);
  }
}
