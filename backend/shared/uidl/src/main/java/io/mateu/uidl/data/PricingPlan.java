package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/**
 * One plan on a {@link PricingTable}: a name, a price and its period (e.g. {@code "/mo"}), a list
 * of feature lines, and a call-to-action ({@code ctaLabel} + {@code actionId}). {@code featured}
 * highlights this plan as the recommended one.
 */
@Builder
public record PricingPlan(
    String id,
    String name,
    String price,
    String period,
    boolean featured,
    List<String> features,
    String ctaLabel,
    String actionId) {}
