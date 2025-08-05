package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record Card(
    String id,
    CardImage image,
    String headerPrefix,
    String header,
    String title,
    String subtitle,
    String headerSuffix,
    CardContent content,
    List<CardVariant> variants,
    String footer,
    String style,
    String cssClasses)
    implements Component {}
