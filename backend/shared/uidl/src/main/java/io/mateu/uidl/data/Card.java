package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A card: optional media, a header (prefix, title, subtitle, suffix), the {@code content} and a
 * footer — each slot any component. {@link CardVariant}s change its look (outlined, elevated…).
 */
@Builder
public record Card(
    String id,
    Component media,
    Component headerPrefix,
    Component header,
    Component title,
    Component subtitle,
    Component headerSuffix,
    Component content,
    Component footer,
    List<CardVariant> variants,
    String style,
    String cssClasses)
    implements Component {}
