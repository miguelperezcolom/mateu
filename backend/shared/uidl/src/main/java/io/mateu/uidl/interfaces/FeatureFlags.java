package io.mateu.uidl.interfaces;

/**
 * Answers whether a feature flag is on for the current request. Register one or more as beans.
 *
 * <p>This is the hook behind the data-driven {@code show} of a tab — {@code show:} on a {@code
 * routes.yaml} child, {@code @Tab(show = …)} on an in-page tab, {@code @Subresource(show = …)}: the
 * tab is offered only when its flag is on (a capability the tenancy has, a rollout switch).
 *
 * <p>It is deliberately the simplest possible supplier — a flag NAME in, a boolean out — until the
 * expression language lands (plan P4, which will also bring {@code @EnabledIf} and the flags in the
 * manifest); a {@code show} condition then becomes an expression over {@code app.flags} and this
 * interface keeps answering the flag lookups. With no bean registered, or no bean that knows the
 * flag, the flag is ON: declaring a condition never hides a tab in an app that does not answer it.
 */
public interface FeatureFlags {

  /**
   * Whether {@code flag} is on, or {@code null} when this supplier does not know it (the next one
   * is asked).
   */
  Boolean isEnabled(String flag, HttpRequest httpRequest);
}
