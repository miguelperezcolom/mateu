package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A read-only FAQ list: collapsible question/answer rows. Items marked {@code open} start expanded;
 * expanding/collapsing is client-side (no server round-trip). Design-system neutral, dark-mode
 * aware.
 */
@Builder
public record Faq(String id, List<FaqItem> items, String style, String cssClasses)
    implements Component {}
