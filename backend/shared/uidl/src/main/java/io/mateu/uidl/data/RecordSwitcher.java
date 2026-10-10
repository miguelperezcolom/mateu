package io.mateu.uidl.data;

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
 */
@Builder
public record RecordSwitcher(
    List<Option> options,
    String value,
    SwitcherType type,
    String label,
    boolean searchable,
    boolean disabled) {

  public RecordSwitcher {
    options = options != null ? options : List.of();
    type = type != null ? type : SwitcherType.object;
  }

  public static RecordSwitcher of(List<Option> options, String value) {
    return new RecordSwitcher(options, value, SwitcherType.object, null, false, false);
  }
}
