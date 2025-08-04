package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record Breadcrumbs(
    String currentItemText, List<Breadcrumb> breadcrumbs, String style, String cssClasses)
    implements Component {}
