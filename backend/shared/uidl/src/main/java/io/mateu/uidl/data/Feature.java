package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One cell of a {@link FeatureGrid}: an {@code icon} (emoji or text), a title, a description and an
 * optional {@code actionId} that makes the card clickable.
 */
@Builder
public record Feature(String icon, String title, String description, String actionId) {}
