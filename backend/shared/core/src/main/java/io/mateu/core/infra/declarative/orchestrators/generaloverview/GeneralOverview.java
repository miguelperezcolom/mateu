package io.mateu.core.infra.declarative.orchestrators.generaloverview;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.GeneralOverviewDisplay;
import io.mateu.uidl.data.GridTrack;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.ResponsiveGrid;
import io.mateu.uidl.data.Slotted;
import io.mateu.uidl.fluent.AutoSaveTrigger;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * Record overview page (the Oracle Redwood "General Overview" template): a <b>context switcher</b>
 * at the top jumps between records without leaving the page, and the selected record renders below
 * — typically an {@code EntityHeader} (title, badges, facts strip, highlighted metric) over
 * property-list cards.
 *
 * <p>Extend it, implement {@link #options} (the switcher's entries), {@link #load} and {@link
 * #overview}, and route the class with {@code @UI}/{@code @Route}. The first option is selected by
 * default; picking another re-renders the overview in place.
 */
public abstract class GeneralOverview<Row> implements TriggersSupplier, OptionsSupplier {

  @Label("")
  public String record;

  @Colspan(2)
  @Label("")
  public Callable<Component> _overview = this::build;

  // ── Developer API ─────────────────────────────────────────────────────────

  /** The context switcher's entries (value = record id, label = what the user reads). */
  protected abstract List<Option> switcherOptions(HttpRequest httpRequest);

  /** Loads the record behind a switcher value. Null hides the overview. */
  protected abstract Row load(String id, HttpRequest httpRequest);

  /**
   * The record's overview — typically an {@code EntityHeader} with the title/badges/facts strip
   * over property cards ({@code Card} + {@code PropertyRow}s, {@code StatusList}, …).
   */
  protected abstract Component overview(Row row, HttpRequest httpRequest);

  /**
   * The contextual {@code info} panel (the Redwood general-overview {@code info} slot): secondary,
   * read-only context about the record — related contacts, recent activity, notes — drawn beside
   * the overview on wide pages and stacked with it on narrow ones (above it when {@link
   * GeneralOverviewDisplay#promoteInfoSlot()} is on). Null (the default) = no info panel.
   */
  protected Component info(Row row, HttpRequest httpRequest) {
    return null;
  }

  /** The info panel's width on wide pages (a CSS length). */
  protected String infoWidth() {
    return "20rem";
  }

  /** This page's built-in affordances (see {@link GeneralOverviewDisplay}). */
  protected GeneralOverviewDisplay display() {
    return GeneralOverviewDisplay.defaults();
  }

  /** What to show when no record is selected/found. */
  protected Component emptyOverview() {
    return EmptyState.builder()
        .icon("🗂")
        .title("Select a record")
        .description("Pick a record in the switcher above.")
        .build();
  }

  // ── Wiring ────────────────────────────────────────────────────────────────

  private HttpRequest currentRequest;

  @Override
  public boolean supports(Class<?> fieldType, String fieldName, Class<?> formType) {
    return "record".equals(fieldName);
  }

  @Override
  public List<Option> options(String fieldName, HttpRequest httpRequest) {
    currentRequest = httpRequest;
    return switcherOptions(httpRequest);
  }

  private Component build() {
    var id = record;
    if (id == null || id.isBlank()) {
      var options = switcherOptions(currentRequest);
      if (!options.isEmpty()) {
        id = record = String.valueOf(options.get(0).value());
      }
    }
    var row = id == null || id.isBlank() ? null : load(id, currentRequest);
    if (row == null) {
      return emptyOverview();
    }
    var main = overview(row, currentRequest);
    var display = display();
    var info = display.info().shown() ? info(row, currentRequest) : null;
    if (info == null) {
      return main;
    }
    // main + info on the one responsive grid: side by side on wide pages, stacked below 48rem. The
    // stacked order is the DOM order, which is what promoteInfoSlot flips (info first = on top).
    var promote = display.promoteInfoSlot().enabled();
    var slots =
        promote
            ? List.<Component>of(new Slotted("info", info), new Slotted("main", main))
            : List.<Component>of(new Slotted("main", main), new Slotted("info", info));
    return new ResponsiveGrid(
        "general-overview",
        List.of(GridTrack.fill(), GridTrack.fixed(infoWidth())),
        null,
        slots,
        null,
        "48rem",
        "\"main info\"",
        null,
        null);
  }

  @io.mateu.uidl.annotations.Action
  public Object switchRecord(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    return this;
  }

  @Override
  public List<Trigger> triggers(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    // changing the switcher re-renders the overview in place (class annotations are not
    // inherited, so the auto-save trigger is declared here instead of @AutoSave)
    return List.of(new AutoSaveTrigger("switchRecord", 0));
  }
}
