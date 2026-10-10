package io.mateu.uidl;

/**
 * Texts the renderers show (titles, labels, KPIs, texts…) are templates: a {@code ${…}} inside them
 * is evaluated against the view's state. A value that comes from DATA — a record's {@code
 * toString()}, a field value, something a user typed — must never be evaluated, so before putting
 * one into such a text, pass it through {@link #literal(String)}.
 *
 * <pre>{@code
 * public String title() {
 *   return "Booking " + Templates.literal(booking.guestName());
 * }
 * }</pre>
 *
 * (Better still, keep data in the state and reference it: {@code "Booking ${state.guestName}"}.)
 */
public final class Templates {

  private Templates() {}

  /**
   * {@code text} escaped so the renderers show it as is: a <code>${</code> becomes <code>\${</code>
   * (and a backslash <code>\\</code>) — only when the text contains <code>${</code>; any other text
   * is returned unchanged, since a text without the marker is never evaluated.
   */
  public static String literal(String text) {
    if (text == null || !text.contains("${")) {
      return text;
    }
    return text.replace("\\", "\\\\").replace("${", "\\${");
  }
}
