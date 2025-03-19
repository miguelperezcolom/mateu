package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A view part. E.g. header, footer, main, and left/right asides
 *
 * @param cssClasses Css cssClasses to be applied to this view part
 * @param componentIds List of component ids for this view part
 */
public record ViewPartDto(String cssClasses, List<String> componentIds) {

  public ViewPartDto {
    componentIds = Collections.unmodifiableList(componentIds);
  }

  public List<String> componentIds() {
    return Collections.unmodifiableList(componentIds);
  }
}
