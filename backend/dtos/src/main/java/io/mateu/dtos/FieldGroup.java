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
public record FieldGroup(String id, String caption, List<FieldGroupLine> lines, int columns) {

  public FieldGroup {
    lines = Collections.unmodifiableList(lines);
  }

  @Override
  public List<FieldGroupLine> lines() {
    return Collections.unmodifiableList(lines);
  }
}
