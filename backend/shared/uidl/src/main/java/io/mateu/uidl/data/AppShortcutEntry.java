package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * An app-wide shortcut as DATA — the twin of {@link io.mateu.uidl.annotations.AppShortcut} for a
 * code-authored ({@code AppShell.shortcuts}) or YAML ({@code type: AppShell}, {@code shortcuts:})
 * shell. A {@code key} and/or a quick-launch {@code code}; a {@code route} or an {@code actionId}.
 */
@Experimental("app shortcuts (3.0-alpha, E2 patterns)")
@Builder
public record AppShortcutEntry(
    String key, String route, String actionId, String label, String code) {

  /** A key that goes to a route. */
  public static AppShortcutEntry route(String key, String route, String label) {
    return new AppShortcutEntry(key, route, null, label, null);
  }

  /** The same entry with a quick-launch code. */
  public AppShortcutEntry withCode(String code) {
    return new AppShortcutEntry(key, route, actionId, label, code);
  }
}
