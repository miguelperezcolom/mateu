package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A group of fields
 *
 * @param id Field group targetId
 * @param caption Field group title
 * @param lines Lines which are contained in this group
 */
public record FieldGroupDto(String id, String caption, List<FieldGroupLineDto> lines, int columns) {

  public FieldGroupDto {
    lines = Collections.unmodifiableList(lines);
  }

  @Override
  public List<FieldGroupLineDto> lines() {
    return Collections.unmodifiableList(lines);
  }
}
