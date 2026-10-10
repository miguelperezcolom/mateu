package io.mateu.uidl.data;

/**
 * What a {@link RecordSwitcher} switches (the Redwood {@code dataSwitcherType}): {@code object} —
 * the record shown (another customer, another booking); {@code context} — the context the page is
 * evaluated in (a business unit, a period), which the page's contents depend on.
 */
public enum SwitcherType {
  object,
  context
}
