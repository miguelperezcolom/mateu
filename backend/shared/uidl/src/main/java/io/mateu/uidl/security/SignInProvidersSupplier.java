package io.mateu.uidl.security;

import java.util.List;

/**
 * Declares the ways to sign in to the app's UIs in code — register one as a bean. Used when the
 * settings name no provider ({@code mateu.auth.providers} wins when set); the providers of several
 * suppliers are offered in bean order.
 *
 * <p>Read where the UI presents itself (the served page, the mobile manifest), not per request: it
 * must not depend on the caller.
 */
@FunctionalInterface
public interface SignInProvidersSupplier {

  /** The providers, in display order. */
  List<SignInProvider> signInProviders();

  /**
   * Whether the user signs in before the first screen (true) or only when a call is refused with a
   * 401 (false); null = leave it to the setting {@code mateu.auth.login-on-start}, default true.
   */
  default Boolean loginOnStart() {
    return null;
  }

  /** Where the browser goes to sign out of a framework-owned session; null = none. */
  default String logoutUrl() {
    return null;
  }
}
