package io.mateu.uidl.data;

/**
 * One entry of the app's notification inbox (the header bell): a short title, an optional longer
 * text, an optional route to navigate to when clicked, whether it is still unread, and a display
 * timestamp (already formatted — the server owns the locale/relative formatting).
 */
public record AppNotification(
    String id, String title, String text, String route, boolean unread, String when) {

  public AppNotification(String id, String title, String text, String route) {
    this(id, title, text, route, true, null);
  }
}
