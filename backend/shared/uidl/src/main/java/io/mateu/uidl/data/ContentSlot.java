package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A hole for managed content filled by the content service, resolved by the host while it builds
 * the view and replaced by its fallback when there is none.
 *
 * <p>The fluent and YAML twin of {@link io.mateu.uidl.annotations.ContentSlot}, with the same
 * meaning for each attribute.
 *
 * @param key {@code application.screen.name}, the contract with the content service
 * @param fallback what is painted when there is no content; null/blank = nothing
 * @param timeoutMs how long the host waits; null = the content remote's default
 * @param description for the content editors
 * @param degradeToClient when the content does not arrive in time, let the renderer ask for it
 */
@Experimental
@Builder
public record ContentSlot(
    String key,
    String fallback,
    Integer timeoutMs,
    String description,
    Boolean degradeToClient,
    String style,
    String cssClasses)
    implements Component {}
