package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record MasterDetailLayout(
    String id,
    Component master,
    Component detail,
    Orientation orientation,
    SplitLayoutVariant variant,
    String style,
    String cssClasses)
    implements Component {

  public MasterDetailLayout(Component master, Component detail) {
    this(null, master, detail, Orientation.horizontal, SplitLayoutVariant.minimal, "", "");
  }
}
