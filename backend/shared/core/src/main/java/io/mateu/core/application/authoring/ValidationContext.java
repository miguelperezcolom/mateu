package io.mateu.core.application.authoring;

import java.util.Collection;
import java.util.Set;
import java.util.function.Predicate;

/**
 * What the app around a definition knows, for the semantic checks of {@link UidlValidator}: which
 * names resolve. Each predicate may be null — "unknown here" — and its check is then skipped (an
 * agent drafting a screen with no app behind it is not told every source is missing).
 *
 * @param source whether a {@code sources.yaml} entry of that name exists ({@code ref:} of a REST
 *     data source)
 * @param partial whether a {@code type: Partial} {@code ref:} resolves
 * @param component whether a {@code type: ComponentRef} {@code ref:} is in {@code components.yaml}
 * @param action whether an action id is in the app's action catalogue ({@code actions.yaml}); a
 *     null predicate counts as an empty catalogue
 * @param fieldType whether a {@code fieldType:} is in {@code types.yaml}
 */
public record ValidationContext(
    Predicate<String> source,
    Predicate<String> partial,
    Predicate<String> component,
    Predicate<String> action,
    Predicate<String> fieldType) {

  /** Nothing known: only the structural checks and the page's own declared actions. */
  public static ValidationContext none() {
    return new ValidationContext(null, null, null, null, null);
  }

  /** A context over fixed name sets (tests, the conformance corpus); a null set = unknown. */
  public static ValidationContext of(
      Collection<String> sources,
      Collection<String> partials,
      Collection<String> components,
      Collection<String> actions,
      Collection<String> fieldTypes) {
    return new ValidationContext(
        in(sources), in(partials), in(components), in(actions), in(fieldTypes));
  }

  private static Predicate<String> in(Collection<String> names) {
    if (names == null) {
      return null;
    }
    var set = Set.copyOf(names);
    return set::contains;
  }
}
