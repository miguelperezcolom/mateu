package io.mateu.uidl.data;

import io.mateu.uidl.interfaces.Content;
import lombok.Builder;

@Builder
public record MasterDetailLayout(
    Content master,
    Content detail,
    SplitLayoutOrientation orientation,
    SplitLayoutVariant variant,
    String style)
    implements Content {

  public MasterDetailLayout(Content master, Content detail) {
    this(master, detail, null, null, "");
  }
}
