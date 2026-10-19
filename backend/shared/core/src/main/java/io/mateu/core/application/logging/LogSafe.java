package io.mateu.core.application.logging;

/**
 * A caller-sent string as a log argument: clipped to {@value #MAX} characters, with every control
 * character (CR, LF, tabs, escapes) replaced by {@code ?} — so a value an agent or a browser chose
 * (a route, an event name, a path) can neither forge log lines nor flood the log.
 */
public final class LogSafe {

  /** The most characters of one value that reach a log line. */
  public static final int MAX = 256;

  private LogSafe() {}

  public static String of(String value) {
    if (value == null) {
      return "null";
    }
    var clipped = value.length() > MAX ? value.substring(0, MAX) + "…" : value;
    var out = new StringBuilder(clipped.length());
    for (int i = 0; i < clipped.length(); i++) {
      char c = clipped.charAt(i);
      out.append(Character.isISOControl(c) ? '?' : c);
    }
    return out.toString();
  }
}
