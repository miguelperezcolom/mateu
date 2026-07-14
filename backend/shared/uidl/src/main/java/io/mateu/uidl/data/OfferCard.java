package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A current-vs-upgrade offer card: an optional {@code image} header, a floating {@code tag} chip,
 * {@code title} + {@code subtitle}, {@code features} as outline chips and a footer. When {@code
 * current} is true the footer shows the muted {@code currentLabel} (no CTA); otherwise a full-width
 * primary button ({@code actionLabel} with {@code priceLabel} right-aligned inside) dispatches
 * {@code actionId} with no parameters, and the card gets an accent border. Design-system neutral,
 * dark-mode aware.
 */
@Builder
public record OfferCard(
    String id,
    String tag,
    String title,
    String subtitle,
    String image,
    List<String> features,
    String priceLabel,
    String actionLabel,
    String actionId,
    boolean current,
    String currentLabel,
    String style,
    String cssClasses)
    implements Component {}
