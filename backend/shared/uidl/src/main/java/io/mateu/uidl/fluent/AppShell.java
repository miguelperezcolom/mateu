package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;
import lombok.Singular;
import lombok.With;

@Builder
@With
public record AppShell(
    String clientSideComponentId,
    String route,
    String homeRoute,
    String homeBaseUrl,
    String homeServerSideType,
    String homeUriPrefix,
    String homeConsumedRoute,
    String serverSideType,
    String favicon,
    String pageTitle,
    String title,
    String subtitle,
    @Singular("menuItem") List<Actionable> menu,
    AppVariant variant,
    AppLayout layout,
    @Singular List<Component> widgets,
    boolean drawerClosed,
    String style,
    String cssClasses,
    String logo,
    /**
     * The app's brand accent, a CSS colour — the data-authored twin of {@code @App(accentColor)}.
     * Blank/null: none. When both are present the shell's own value wins.
     */
    String accentColor,
    /**
     * The way back up from this app — the twin of {@code @App(backLink)}: {@code PARENT} draws a
     * single "← Parent" link instead of breadcrumbs (a record master whose tabs are pages). Null:
     * the {@code @App} value, else breadcrumbs.
     */
    io.mateu.uidl.annotations.BackLink backLink)
    implements Component, PageMainContent {

  public AppShell {
    menu = menu != null ? menu : List.of();
    // A shell federating remote sections that names no variant is drawn MENU_ON_TOP, as it always
    // was: the browser used to force that variant on any shell with remotes, and now respects the
    // one the app declares instead.
    variant =
        variant != null ? variant : hasRemoteMenu(menu) ? AppVariant.MENU_ON_TOP : AppVariant.TABS;
    layout = layout != null ? layout : AppLayout.SINGLE_SLOT;
    route = route != null ? route : "";
  }

  private static boolean hasRemoteMenu(List<Actionable> menu) {
    for (Actionable option : menu) {
      if (option instanceof io.mateu.uidl.data.RemoteMenu) {
        return true;
      }
      if (option instanceof io.mateu.uidl.data.Menu group
          && group.submenu() != null
          && hasRemoteMenu(group.submenu())) {
        return true;
      }
    }
    return false;
  }
}
