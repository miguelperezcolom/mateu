package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record SplitLayout(
    String id,
    Component master,
    Component detail,
    SplitLayoutOrientation orientation,
    SplitLayoutVariant variant,
    boolean fullWidth,
    String style,
    String cssClasses)
    implements Component {

  public SplitLayout(Component master, Component detail) {
    this(null, master, detail, null, null, false, "", "");
  }
}
