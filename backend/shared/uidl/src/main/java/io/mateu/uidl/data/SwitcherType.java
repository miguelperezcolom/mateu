package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * What a {@link RecordSwitcher} switches (the Redwood {@code dataSwitcherType}): {@code object} —
 * the record shown (another customer, another booking); {@code context} — the context the page is
 * evaluated in (a business unit, a period), which the page's contents depend on.
 */
@Experimental("record switcher (3.0-alpha.409)")
public enum SwitcherType {
  object,
  context
}
