package io.mateu.core.application.microfrontends;

import java.util.function.Function;

/**
 * The knobs of server-side micro frontend resolution, read once from Mateu's settings.
 *
 * @param defaultTimeoutMs how long the host waits for a fragment that names no timeout, nor does
 *     its remote ({@value #DEFAULT_TIMEOUT})
 * @param maxBudgetMs the most a view ever waits for its fragments, whatever they declare ({@value
 *     #MAX_BUDGET})
 * @param contentRemoteId the registered remote content slots are resolved against ({@value
 *     #CONTENT_REMOTE})
 * @param contentRoute the route a content slot asks, {@code {key}} standing for its key ({@value
 *     #CONTENT_ROUTE})
 */
public record MicroFrontendSettings(
    int defaultTimeoutMs, int maxBudgetMs, String contentRemoteId, String contentRoute) {

  public static final String DEFAULT_TIMEOUT = "mateu.microfrontends.default-timeout-ms";
  public static final String MAX_BUDGET = "mateu.microfrontends.max-budget-ms";
  public static final String CONTENT_REMOTE = "mateu.content-slots.remote";
  public static final String CONTENT_ROUTE = "mateu.content-slots.route";

  /** Read from a settings source ({@code key -> value}, null when unset). */
  public static MicroFrontendSettings from(Function<String, String> settings) {
    return new MicroFrontendSettings(
        intOf(settings.apply(DEFAULT_TIMEOUT), 500),
        intOf(settings.apply(MAX_BUDGET), 2000),
        textOf(settings.apply(CONTENT_REMOTE), "content"),
        textOf(settings.apply(CONTENT_ROUTE), "/content-slots/{key}"));
  }

  /** The route a content slot with this key asks its remote for. */
  public String contentRouteFor(String key) {
    return contentRoute.replace("{key}", key == null ? "" : key);
  }

  private static int intOf(String value, int fallback) {
    if (value == null || value.isBlank()) {
      return fallback;
    }
    try {
      var parsed = Integer.parseInt(value.trim());
      return parsed > 0 ? parsed : fallback;
    } catch (NumberFormatException e) {
      return fallback;
    }
  }

  private static String textOf(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value.trim();
  }
}
