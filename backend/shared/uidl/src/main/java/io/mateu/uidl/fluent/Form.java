package io.mateu.uidl.fluent;

import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

@Builder
public record Form(
    String id,
    String title,
    String subtitle,
    boolean noHeader,
    Component avatar,
    @Singular("contentItem") List<Component> content,
    @Singular("headerItem") List<Component> header,
    @Singular("footerItem") List<Component> footer,
    @Singular("toolbarItem") List<UserTrigger> toolbar,
    @Singular List<UserTrigger> buttons,
    String style,
    String cssClasses)
    implements Component, ContentSupplier, PageMainContent {

  public Form {
    content = content != null ? content : Collections.emptyList();
    header = header != null ? header : Collections.emptyList();
    footer = footer != null ? footer : Collections.emptyList();
    toolbar = toolbar != null ? toolbar : Collections.emptyList();
    buttons = buttons != null ? buttons : Collections.emptyList();
  }
}
