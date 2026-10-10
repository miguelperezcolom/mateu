package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A categorised ACTION PANEL: a trigger button that opens a layer over the page with the actions of
 * the record grouped in columns, one per category (e.g. Modify, Create, View, Go to) — the "I want
 * to…" menu of back-office suites. Each column shows up to {@code maxPerCategory} actions (0 = 10)
 * and a "Show more" for the rest; populated actions (those with data behind them) are listed first
 * and emphasised, and {@code hideUnpopulatedToggle} offers to hide the others.
 *
 * <p>The actions depend on the record's state simply because the server builds the panel: include
 * (or disable) what applies to the current record. {@code shortcut} (e.g. {@code "ctrl+i"}) opens
 * the panel from the keyboard. Each action dispatches its {@code actionId} (with its {@code
 * parameters}) through the standard action mechanism, like any button.
 */
@Builder
public record ActionPanel(
    String id,
    String label,
    String shortcut,
    List<ActionPanelCategory> categories,
    int maxPerCategory,
    boolean hideUnpopulatedToggle,
    String style,
    String cssClasses)
    implements Component {}
