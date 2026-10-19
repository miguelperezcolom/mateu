package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/** A stack of collapsible panels where one or more can be expanded at a time. */
@Builder
public record AccordionLayout(
    String id,
    List<AccordionPanel> panels,
    AccordionLayoutVariant variant,
    String style,
    String cssClasses)
    implements Component {}
