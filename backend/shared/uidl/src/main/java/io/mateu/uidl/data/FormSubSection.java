package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/** A titled sub-group of fields inside a form section. */
@Builder
public record FormSubSection(String title, List<Component> content, String style, String cssClasses)
    implements Component {}
