package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Rule;
import java.util.List;

/**
 * Supplies client-side reactive form {@link Rule}s (e.g. show/hide, enable/disable, require a field
 * based on another field's value). Implement {@link #rules()} to return the rules Mateu ships to
 * the frontend so they evaluate live without a server round-trip.
 */
public interface RuleSupplier {

  List<Rule> rules();
}
