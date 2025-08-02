package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record AccordionLayout(
    String id,
    List<AccordionPanel> panels,
    AccordionLayoutVariant variant,
    String style,
    String cssClasses)
    implements Component {}
