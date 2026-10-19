package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import java.util.List;
import lombok.Builder;

/** A titled section of a form that groups fields, with an optional toolbar. */
@Builder
public record FormSection(
    String title,
    List<UserTrigger> toolbar,
    List<Component> content,
    String style,
    String cssClasses)
    implements Component {}
