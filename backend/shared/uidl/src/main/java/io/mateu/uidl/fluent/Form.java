package io.mateu.uidl.fluent;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record Form(
    String id,
    String favicon,
    String pageTitle,
    String title,
    String subtitle,
    List<Action> actions,
    List<Trigger> triggers,
    List<Component> content,
    List<Component> header,
    List<Component> footer,
    List<UserTrigger> toolbar,
    List<UserTrigger> buttons)
    implements Component {

  public Form {
    actions = actions != null ? actions : Collections.emptyList();
    triggers = triggers != null ? triggers : Collections.emptyList();
    content = content != null ? content : Collections.emptyList();
    header = header != null ? header : Collections.emptyList();
    footer = footer != null ? footer : Collections.emptyList();
    toolbar = toolbar != null ? toolbar : Collections.emptyList();
    buttons = buttons != null ? buttons : Collections.emptyList();
  }
}
