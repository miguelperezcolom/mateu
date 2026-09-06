package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;
import lombok.With;

/**
 * A menu leaf that RUNS client-side {@link Rule rules} when clicked instead of navigating to a
 * route. It is the {@code rule} half of the two menu-leaf primitives (the other being a route): a
 * {@code @Menu} field typed {@code Rule} or {@code List<Rule>} maps to this. A {@code RunAction}
 * rule covers "hit the server", so a menu that does something is expressed here rather than as a
 * third kind of entry.
 */
@Builder
@With
public record RuleLink(
    String path,
    String label,
    List<Rule> rules,
    boolean selected,
    Component component,
    String className,
    boolean disabled,
    boolean disabledOnClick,
    Object itemData,
    String description)
    implements Actionable {

  public RuleLink {
    rules = rules == null ? List.of() : List.copyOf(rules);
  }

  public RuleLink(String label, List<Rule> rules) {
    this(null, label, rules, false, null, null, false, false, null, null);
  }
}
