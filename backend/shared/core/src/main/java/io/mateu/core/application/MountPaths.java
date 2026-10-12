package io.mateu.core.application;

import io.mateu.core.application.runaction.RunActionCommand;

/**
 * Bridges the two spellings of a route inside a class-declared NON-ROOT mount
 * ({@code @UI("/shop")}): the browser asks with the route RELATIVE to the mount ({@code /orders},
 * posted to {@code /shop/mateu/...}) while the route registry holds it ABSOLUTE ({@code
 * shop/orders}, a {@code type: Routes} file tagged {@code basePath: /shop} is prefixed on load). A
 * YAML mount does not need this — its controller puts the mount on the route before anything
 * resolves it.
 */
public final class MountPaths {

  private MountPaths() {}

  /** The mount the request was served by ({@code shop}), or {@code ""} for the root mount. */
  public static String mountOf(RunActionCommand command) {
    if (command == null) {
      return "";
    }
    return normalize(command.baseUrl());
  }

  /**
   * The mount of a base url ({@code /shop} → {@code shop}); {@code ""} for root or a remote url.
   */
  public static String normalize(String baseUrl) {
    if (baseUrl == null || baseUrl.isBlank() || baseUrl.contains("://")) {
      return "";
    }
    var mount = baseUrl.strip();
    while (mount.startsWith("/")) {
      mount = mount.substring(1);
    }
    while (mount.endsWith("/")) {
      mount = mount.substring(0, mount.length() - 1);
    }
    return mount;
  }

  /** Whether {@code route} already names the mount ({@code /shop/orders} for {@code shop}). */
  public static boolean startsWithMount(String route, String mount) {
    if (mount == null || mount.isEmpty() || route == null) {
      return false;
    }
    var relative = route.startsWith("/") ? route.substring(1) : route;
    return relative.equals(mount) || relative.startsWith(mount + "/");
  }

  /** {@code /orders} inside {@code shop} → {@code /shop/orders}. */
  public static String withMount(String mount, String route) {
    if (mount == null || mount.isEmpty()) {
      return route;
    }
    var relative = route == null ? "" : (route.startsWith("/") ? route.substring(1) : route);
    return "/" + mount + (relative.isEmpty() ? "" : "/" + relative);
  }

  /**
   * {@code shop/orders/:id} inside {@code shop} → {@code orders/:id}, keeping the leading slash
   * convention of the input; a route outside the mount is answered as it is.
   */
  public static String withoutMount(String mount, String route) {
    if (mount == null || mount.isEmpty() || !startsWithMount(route, mount)) {
      return route;
    }
    var slash = route.startsWith("/");
    var relative = slash ? route.substring(1) : route;
    var rest = relative.substring(mount.length());
    if (rest.startsWith("/")) {
      rest = rest.substring(1);
    }
    return (slash ? "/" : "") + rest;
  }
}
