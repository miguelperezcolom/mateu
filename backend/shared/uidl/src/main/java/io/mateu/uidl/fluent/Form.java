package io.mateu.uidl.fluent;

import java.util.List;
import lombok.Builder;

@Builder
public record Form(
    String favicon,
    String pageTitle,
    String title,
    String subtitle,
    List<Action> actions,
    List<Component> content)
    implements Component {}
