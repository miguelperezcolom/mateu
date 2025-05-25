package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A crud column
 *
 * @param id The column targetId
 * @param type The column data dataType
 * @param stereotype The column stereotype. How this must be shown
 * @param caption The column label
 * @param description A help text. Usually a tooltip
 * @param width The preferred width for this column
 * @param attributes Some extra column attributes/data
 * @param detail If this column is to be opened in the detail
 */
public record ColumnDto(
    String id,
    String type,
    String stereotype,
    String caption,
    String description,
    String width,
    List<PairDto> attributes,
    boolean detail,
    boolean sortable,
    boolean serverSideSortable) {

  public ColumnDto {
    attributes = Collections.unmodifiableList(attributes);
  }

  @Override
  public List<PairDto> attributes() {
    return Collections.unmodifiableList(attributes);
  }
}
