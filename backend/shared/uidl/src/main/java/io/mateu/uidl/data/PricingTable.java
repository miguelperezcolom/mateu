package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A pricing / plan-comparison table: a row of {@link PricingPlan} cards side by side, one
 * optionally marked {@code featured} (highlighted). Each plan lists its features and a
 * call-to-action button whose {@code actionId} runs the matching {@code @Action}. Design-system
 * neutral, dark-mode aware.
 */
@Builder
public record PricingTable(String id, List<PricingPlan> plans, String style, String cssClasses)
    implements Component {}
