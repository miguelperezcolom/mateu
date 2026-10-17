package io.mateu.core.application.export;

import java.util.List;

/**
 * One route's export result. {@code json} is null when skipped ({@code ok=false}). For a {@code
 * :param} route bundled as a TEMPLATE, {@code routePattern} is a regex over the sync path with one
 * capture group per param and {@code paramNames} lists the param names in order — the client
 * matches a concrete path (e.g. {@code orders/42}) against the pattern, extracts the params and
 * feeds them to the pre-rendered structure (client-side data fetch resolves {@code ${state.<p>}}).
 * Both are null for a plain (non-template) entry.
 */
public record BundleEntry(
    String route,
    String syncPath,
    String json,
    boolean ok,
    String skipReason,
    String routePattern,
    List<String> paramNames,
    /**
     * The route's CONTENT load, when it differs from {@link #json()}: the increment the server
     * answers when an app shell asks for what goes in its content slot ({@code consumedRoute} = the
     * shell's, not {@code "_empty"}). Under a mount whose root is an app shell, {@link #json()} is
     * the fresh-load answer — the SHELL — and a sub-route's own screen only exists as this second
     * increment. Shipping only the shell is what made every bundled sub-route render the shell
     * again inside the shell (#557: a deep link "rendered HOME", or nested shells until the tab
     * died). Null when the route is not under an app shell, where the two loads are the same
     * increment.
     */
    String contentJson) {
  /** Plain (non-template) entry. */
  public BundleEntry(String route, String syncPath, String json, boolean ok, String skipReason) {
    this(route, syncPath, json, ok, skipReason, null, null, null);
  }

  /** Pre-content shape: a template (or plain) entry whose content load is its shell. */
  public BundleEntry(
      String route,
      String syncPath,
      String json,
      boolean ok,
      String skipReason,
      String routePattern,
      List<String> paramNames) {
    this(route, syncPath, json, ok, skipReason, routePattern, paramNames, null);
  }
}
