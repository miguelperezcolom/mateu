package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ContentSupplier;
import java.util.List;
import lombok.Builder;

/** A row of a board layout; its items share the width. */
@Builder
public record BoardLayoutRow(List<Component> content, String style, String cssClasses)
    implements Component, ContentSupplier {}
