package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

@Builder
public record App(
    String route,
    String favicon,
    String pageTitle,
    String title,
    String subtitle,
    @Singular("menuItem") List<Actionable> menu,
    AppVariant variant,
    @Singular List<Component> widgets,
    boolean drawerClosed,
    String style,
    String cssClasses)
    implements Component, PageMainContent {

  public App {
    variant = variant != null ? variant : AppVariant.TABS;
    menu = menu != null ? menu : List.of();
  }
}
