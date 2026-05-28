package io.mateu.uidl.fluent;

import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.data.KPI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

@Builder
public record PageView(
    String id,
    String pageTitle,
    String favicon,
    String title,
    String subtitle,
    List<Breadcrumb> breadcrumbs,
    Component avatar,
    @Singular("contentItem") List<Component> content,
    @Singular("headerItem") List<Component> header,
    @Singular("footerItem") List<Component> footer,
    @Singular("toolbarItem") List<UserTrigger> toolbar,
    @Singular List<UserTrigger> buttons,
    @Singular("badgeItem") List<Badge> badges,
    @Singular("kpiItem") List<KPI> kpis,
    String style,
    String cssClasses,
    @Singular("actionItem") List<Action> actions)
    implements Component, ActionSupplier {
  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    return actions;
  }
}
