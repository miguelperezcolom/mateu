package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/** A breadcrumb trail of links showing where the current page sits in the hierarchy. */
@Builder
public record Breadcrumbs(
    String currentItemText, List<Breadcrumb> breadcrumbs, String style, String cssClasses)
    implements Component {}
