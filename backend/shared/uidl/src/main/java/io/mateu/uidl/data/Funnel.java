package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A read-only conversion funnel: stacked horizontal bars, each narrower than the last, showing how
 * a value drops through stages with the conversion percentage between them. Design-system neutral,
 * dark-mode aware.
 */
@Builder
public record Funnel(String id, List<FunnelStage> stages, String style, String cssClasses)
    implements Component {}
