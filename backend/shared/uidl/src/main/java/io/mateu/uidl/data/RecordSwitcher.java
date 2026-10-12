package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;
import lombok.Builder;

/**
 * A record/context switcher shown in the page header (the Redwood {@code selectObject}/{@code
 * selectContext} header element): a compact selector next to the title that jumps between records
 * (or contexts) without leaving the page. Supplied by a page implementing {@link
 * io.mateu.uidl.interfaces.RecordSwitcherSupplier}.
 *
 * @param options the entries (value = id, label = what the user reads, description = secondary
 *     text)
 * @param value the value currently selected
 * @param type whether it switches the {@code object} shown or the {@code context}
 * @param label an optional hint shown with the selector ("Customer", "Business unit")
 * @param searchable whether the selector offers a type-to-filter box (worth it for long lists)
 * @param disabled shown, but read-only
 * @param optionsSource where to fetch the entries instead of {@code options}: a REST source
 *     (usually a {@code sources.yaml} reference) read with its {@code itemsPath}/{@code
 *     valuePath}/{@code labelPath} by the browser — the data twin of building the options in {@code
 *     switcher(...)}
 * @param route where a pick NAVIGATES, with {@code ${state._record}} standing for the picked value
 *     ({@code customers/${state._record}}) — the data twin of {@code switchTo} returning a URI;
 *     null dispatches {@code actionId} instead
 * @param actionId the action a pick dispatches (with the value in {@code _record}) when there is no
 *     {@code route}; null means {@link io.mateu.uidl.interfaces.RecordSwitcherSupplier#ACTION_ID}
 */
@Builder
@Experimental("record switcher (3.0-alpha.409)")
public record RecordSwitcher(
    List<Option> options,
    String value,
    SwitcherType type,
    String label,
    boolean searchable,
    boolean disabled,
    @Experimental("YAML page header (3.0 beta)") RestDataSource optionsSource,
    @Experimental("YAML page header (3.0 beta)") String route,
    @Experimental("YAML page header (3.0 beta)") String actionId) {

  public RecordSwitcher {
    options = options != null ? options : List.of();
    type = type != null ? type : SwitcherType.object;
  }

  /** As the canonical constructor, with no options source, route or action of its own. */
  public RecordSwitcher(
      List<Option> options,
      String value,
      SwitcherType type,
      String label,
      boolean searchable,
      boolean disabled) {
    this(options, value, type, label, searchable, disabled, null, null, null);
  }

  public static RecordSwitcher of(List<Option> options, String value) {
    return new RecordSwitcher(options, value, SwitcherType.object, null, false, false);
  }
}
