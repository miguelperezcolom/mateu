package io.mateu.uidl.fluent;

import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.data.KPI;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

@Builder
public record PageView(
    String id,
    String pageTitle,
    int level,
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
    @Singular("bannerItem") List<PageBanner> banners,
    String style,
    String cssClasses,
    Boolean toc,
    @Singular("actionItem") List<Action> actions,
    @Singular("fabItem") List<UserTrigger> fabs)
    implements Component, ActionSupplier {
  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    return actions;
  }
}
