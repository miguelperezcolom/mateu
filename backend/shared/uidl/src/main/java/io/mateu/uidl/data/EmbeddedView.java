package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;

/**
 * Embeds a routed view (a {@code @UI}/{@code @Route} model view — e.g. a {@code Wizard}) as an
 * INDEPENDENT server-side component: it renders inside the host tree but routes its OWN actions
 * back to itself (its step navigation, saves, etc.), unlike {@link ModelViewComponent}, which
 * renders the view inline and lets its actions bubble to the host.
 *
 * <p>This is what makes a wizard-in-a-drawer work (the Redwood "Guided Process Drawer"): return a
 * {@link Drawer} whose {@code content} is {@code new EmbeddedView(wizard)} and the wizard advances
 * step by step inside the drawer.
 */
public record EmbeddedView(Object view) implements Component {}
