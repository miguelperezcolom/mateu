package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * The built-in affordances of a {@code GeneralOverview} (the Redwood general-overview {@code
 * displayOptions}):
 *
 * <ul>
 *   <li>{@code info} — the contextual {@code info} panel beside the overview (shown when the page
 *       supplies one); {@code off} drops it;
 *   <li>{@code promoteInfoSlot} — when the page is too narrow for two columns, the info panel
 *       stacks ABOVE the main content instead of below it (default {@code off}).
 * </ul>
 *
 * Both are plain on/off switches: an informational panel has no "disabled" state.
 */
@Builder(toBuilder = true)
@Experimental("archetype display options (3.0-alpha.409)")
public record GeneralOverviewDisplay(Toggle info, Toggle promoteInfoSlot) {

  public static GeneralOverviewDisplay defaults() {
    return new GeneralOverviewDisplay(Toggle.on, Toggle.off);
  }

  @Override
  public Toggle info() {
    return Toggle.or(info, Toggle.on);
  }

  @Override
  public Toggle promoteInfoSlot() {
    return Toggle.or(promoteInfoSlot, Toggle.off);
  }
}
