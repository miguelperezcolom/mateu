package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Action;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

/**
 * The app's catalogue of named, CLIENT-RUNNABLE actions: flows ({@code steps}) and REST actions
 * ({@code restAction}) declared once and runnable from the shell menu and from any page by id.
 *
 * <p>Two producers feed one table, exactly like {@link RestSourceCatalog}: {@code
 * ActionCatalogSupplier} beans are the DERIVED half, an authored {@code specs/ui/actions.yaml} (or
 * any {@code type: Actions} file under {@code specs/ui}) is merged on top, and <strong>the authored
 * entry wins</strong>, replacing the derived one outright.
 *
 * <p>Ids are GLOBAL — an action of the catalogue is not a screen, so it does not belong to a mount.
 * An OWNER's own action (a page's {@code actions:}, the shell's {@code actions:}, a Java method)
 * always wins over a catalogue entry of the same id: the catalogue fills gaps, it never overrides.
 */
public record ActionCatalog(List<Action> actions) {

  public ActionCatalog {
    actions =
        actions == null
            ? List.of()
            : actions.stream()
                .filter(a -> a != null && a.id() != null && !a.id().isBlank())
                .toList();
  }

  public static ActionCatalog empty() {
    return new ActionCatalog(List.of());
  }

  /**
   * Named {@code hasNoActions} rather than {@code isEmpty}: a record serialised by Jackson reads an
   * {@code isX()} accessor as an extra property (the bundle-manifest gotcha) — any helper added
   * here needs a name that is not a getter.
   */
  public boolean hasNoActions() {
    return actions.isEmpty();
  }

  /** The entry an id names, or empty when the catalogue does not carry it. */
  public Optional<Action> get(String id) {
    if (id == null || id.isBlank()) {
      return Optional.empty();
    }
    var wanted = id.trim();
    return actions.stream().filter(action -> wanted.equals(action.id())).findFirst();
  }

  /**
   * Merges this (authored) catalogue over a derived one, keyed by id. An authored entry REPLACES
   * the derived one outright — a half-overridden flow would be far harder to reason about than a
   * replaced one (the same rule as {@link RestSourceCatalog#mergedOver}).
   */
  public ActionCatalog mergedOver(ActionCatalog derived) {
    var byId = new LinkedHashMap<String, Action>();
    if (derived != null) {
      derived.actions().forEach(action -> byId.put(action.id(), action));
    }
    actions.forEach(action -> byId.put(action.id(), action));
    return new ActionCatalog(List.copyOf(byId.values()));
  }

  /**
   * True when an action can live in the catalogue: it runs in the browser, so it is a flow (non
   * empty {@code steps}) or a REST call ({@code restAction}). Server logic stays an {@code @Action}
   * method on a class — the catalogue is not a place to name server code.
   */
  public static boolean clientRunnable(Action action) {
    return action != null
        && ((action.steps() != null && !action.steps().isEmpty()) || action.restAction() != null);
  }
}
