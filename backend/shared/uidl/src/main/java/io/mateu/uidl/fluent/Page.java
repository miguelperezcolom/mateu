package io.mateu.uidl.fluent;

import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.KPI;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

@Builder
public record Page(
    String id,
    String pageTitle,
    String favicon,
    String title,
    String subtitle,
    Component avatar,
    @Singular("contentItem") List<Component> content,
    @Singular("headerItem") List<Component> header,
    @Singular("footerItem") List<Component> footer,
    @Singular("toolbarItem") List<UserTrigger> toolbar,
    @Singular List<UserTrigger> buttons,
    @Singular("badgeItem") List<Badge> badges,
    @Singular("kpiItem") List<KPI> kpis,
    String style,
    String cssClasses)
    implements Component {}
