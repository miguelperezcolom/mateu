package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A round user avatar showing an image, initials or a name abbreviation. */
@Builder
public record Avatar(
    String name, String abbreviation, String image, String style, String cssClasses)
    implements Component {

  public Avatar(String name) {
    this(name, "", "", "", "");
  }
}
