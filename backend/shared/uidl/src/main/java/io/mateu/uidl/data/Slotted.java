package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;

/**
 * Places a component into a named slot of a template (coherence-plan #7). Wrap a component in
 * {@code Slotted("header", ...)} and put it in a {@link ResponsiveGrid} that declares {@code
 * gridTemplateAreas} — the renderer sets the component's {@code slot} so it lands in the matching
 * {@code grid-area}. Thin authoring wrapper: fluent components carry no slot of their own.
 */
public record Slotted(String slot, Component content) implements Component {}
