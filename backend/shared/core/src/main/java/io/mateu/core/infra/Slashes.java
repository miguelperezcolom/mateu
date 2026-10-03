package io.mateu.core.infra;

/**
 * Linear-time slash trimming for routes and paths.
 *
 * <p>Replaces {@code s.replaceAll("^/+", "").replaceAll("/+$", "")}: an unanchored {@code /+$} is
 * retried from every position of a slash run that is not at the end, so a client-supplied route
 * like {@code "a" + "/".repeat(50_000) + "b"} costs quadratic time (seconds of CPU per request).
 * Same results, one pass.
 */
public final class Slashes {

  private Slashes() {}

  /** {@code s} without leading and trailing {@code '/'}; {@code ""} for null. */
  public static String trim(String s) {
    if (s == null) {
      return "";
    }
    int start = 0;
    int end = s.length();
    while (start < end && s.charAt(start) == '/') {
      start++;
    }
    while (end > start && s.charAt(end - 1) == '/') {
      end--;
    }
    return s.substring(start, end);
  }

  /** {@code s} without trailing {@code '/'}; {@code ""} for null. */
  public static String trimTrailing(String s) {
    if (s == null) {
      return "";
    }
    int end = s.length();
    while (end > 0 && s.charAt(end - 1) == '/') {
      end--;
    }
    return s.substring(0, end);
  }
}
