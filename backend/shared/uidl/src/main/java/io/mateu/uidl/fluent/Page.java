package io.mateu.uidl.fluent;

import java.util.List;
import lombok.Builder;

@Builder
public record Page(
    String id,
    String pageTitle,
    String favicon,
    String title,
    String subtitle,
    Component avatar,
    List<Component> content,
    List<Component> header,
    List<Component> footer,
    List<UserTrigger> toolbar,
    List<UserTrigger> buttons,
    String style,
    String cssClasses)
    implements Component {}
