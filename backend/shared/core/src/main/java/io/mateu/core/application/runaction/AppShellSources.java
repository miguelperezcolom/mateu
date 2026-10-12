package io.mateu.core.application.runaction;

import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.fluent.AppShell;

/**
 * The REST sources a data-authored app shell declares, by the ROLE the browser asks for: {@code
 * notifications} (the inbox list), {@code notificationsRead} (its "mark as read"), {@code
 * globalSearch} (the palette's entity search) and {@code contextOptions} (a context picker's
 * choices, with the picker's field). What the {@code _appsource} proxy may call is exactly this — a
 * role the shell does not fill answers nothing.
 */
final class AppShellSources {

  static final String NOTIFICATIONS = "notifications";
  static final String NOTIFICATIONS_READ = "notificationsRead";
  static final String GLOBAL_SEARCH = "globalSearch";
  static final String CONTEXT_OPTIONS = "contextOptions";

  private AppShellSources() {}

  static RestDataSource declared(AppShell shell, String role, String field) {
    if (shell == null || role == null) {
      return null;
    }
    return switch (role) {
      case NOTIFICATIONS -> shell.notifications() != null ? shell.notifications().source() : null;
      case NOTIFICATIONS_READ ->
          shell.notifications() != null ? shell.notifications().markRead() : null;
      case GLOBAL_SEARCH -> shell.globalSearch() != null ? shell.globalSearch().source() : null;
      case CONTEXT_OPTIONS ->
          shell.contextSelectors().stream()
              .filter(selector -> selector != null && selector.fieldName() != null)
              .filter(selector -> selector.fieldName().equals(field))
              .map(io.mateu.uidl.data.AppContextSelector::optionsSource)
              .filter(java.util.Objects::nonNull)
              .findFirst()
              .orElse(null);
      default -> null;
    };
  }
}
