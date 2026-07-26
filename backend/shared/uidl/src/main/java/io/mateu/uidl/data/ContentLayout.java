package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * Redwood-style content page layout: the uniform slot grammar shared by the page archetypes. A page
 * is a canonical header (carried by {@code PageDto}) plus this content region, organised into named
 * slots so every template composes the same way and every renderer paints it with one responsive
 * grammar.
 *
 * <ul>
 *   <li>{@code main} — the primary content region (the bulk of the page). Travels as the children
 *       slotted {@code main-N}.
 *   <li>{@code aside} — the contextual secondary region (key-info / detail / overview panel). Sits
 *       beside {@code main} on wide viewports (side given by {@code asidePosition}, width by {@code
 *       asideWidth}, optionally {@code asideSticky}) and stacks under it on narrow ones. Travels as
 *       the children slotted {@code aside-N}.
 *   <li>{@code footer} — a full-width region below both columns. Travels as the children slotted
 *       {@code footer-N}.
 * </ul>
 *
 * Pure layout (no interaction) → rendered design-system-neutrally so every renderer supports it
 * with no per-renderer work.
 */
@Builder
public record ContentLayout(
    String id,
    List<Component> main,
    List<Component> aside,
    List<Component> footer,
    ContentAsidePosition asidePosition,
    String asideWidth,
    boolean asideSticky,
    String style,
    String cssClasses)
    implements Component {}
