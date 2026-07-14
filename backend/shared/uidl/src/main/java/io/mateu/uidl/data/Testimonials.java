package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A responsive grid of testimonial / quote cards (a quote, an author with role and avatar, an
 * optional star rating), for landing/marketing pages. Design-system neutral, dark-mode aware.
 */
@Builder
public record Testimonials(String id, List<Testimonial> items, String style, String cssClasses)
    implements Component {}
