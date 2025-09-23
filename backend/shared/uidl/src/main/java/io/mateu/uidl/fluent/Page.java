package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record Page(
    String id,
    String favicon,
    String pageTitle,
    PageMainContent mainContent,
    String style,
    String cssClasses)
    implements Component {}
