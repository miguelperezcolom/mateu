package io.mateu.uidl.data;

/**
 * One hit of the app-wide entity search (the command palette's data results): a label, an optional
 * secondary line, the route to navigate to, and an optional category caption used to group the
 * palette's results ("Clientes", "Reservas"…).
 */
public record GlobalSearchResult(String label, String description, String route, String category) {

  public GlobalSearchResult(String label, String route) {
    this(label, null, route, null);
  }
}
