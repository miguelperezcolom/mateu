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
    String logo)
    implements Component, PageMainContent {

  public AppShell {
    variant = variant != null ? variant : AppVariant.TABS;
    layout = layout != null ? layout : AppLayout.SINGLE_SLOT;
    menu = menu != null ? menu : List.of();
    route = route != null ? route : "";
  }
}
