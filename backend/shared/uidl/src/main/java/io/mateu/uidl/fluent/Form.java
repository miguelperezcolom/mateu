package io.mateu.uidl.fluent;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record Form(
    String id,
    String title,
    String subtitle,
    boolean noHeader,
    Component avatar,
    List<Component> content,
    List<Component> header,
    List<Component> footer,
    List<UserTrigger> toolbar,
    List<UserTrigger> buttons,
    String style,
    String cssClasses)
    implements Component, HasContent, PageMainContent {

  public Form {
    content = content != null ? content : Collections.emptyList();
    header = header != null ? header : Collections.emptyList();
    footer = footer != null ? footer : Collections.emptyList();
    toolbar = toolbar != null ? toolbar : Collections.emptyList();
    buttons = buttons != null ? buttons : Collections.emptyList();
  }
}
