package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * Priced extras with a live running total (e.g. upsell packages at check-in): a responsive grid of
 * {@link AddOn} cards, each with a +/✓ toggle, and a header-right total ({@code totalLabel} +
 * {@code currency} + sum of added prices, computed client-side). On every toggle, if {@code
 * actionId} is present it is dispatched with {@code { "_item": id, "_added": bool, "_total": number
 * }}. Design-system neutral, dark-mode aware.
 */
@Builder
public record AddOnPicker(
    String id,
    String totalLabel,
    String currency,
    String actionId,
    List<AddOn> items,
    String style,
    String cssClasses)
    implements Component {}
