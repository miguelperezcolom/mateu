package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A crud column
 *
 * @param id The column id
 * @param type The column data type
 * @param stereotype The column stereotype. How this must be shown
 * @param caption The column caption
 * @param description A help text. Usually a tooltip
 * @param width The preferred width for this column
 * @param attributes Some extra column attributes/data
 */
public record Column(
    String id,
    String type,
    String stereotype,
    String caption,
    String description,
    String width,
    List<Pair> attributes) {

  public Column {
    attributes = Collections.unmodifiableList(attributes);
  }

  @Override
  public List<Pair> attributes() {
    return Collections.unmodifiableList(attributes);
  }
}
