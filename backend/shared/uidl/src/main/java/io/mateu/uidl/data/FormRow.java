package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/** A row of a form layout grouping components side by side. */
@Builder(toBuilder = true)
public record FormRow(String id, List<Component> content, String style, String cssClasses)
    implements Component {}
