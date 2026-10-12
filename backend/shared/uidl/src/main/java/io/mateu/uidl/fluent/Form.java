package io.mateu.uidl.fluent;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PageFab;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.data.RecordSwitcher;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/**
 * A page: a header (title, subtitle, toolbar…) over its content — what a YAML page authors as
 * {@code type: Form}. Beside the classic header it carries the page-header elements a Java page
 * gets from its annotations and suppliers, as data: {@code overline}, {@code titlePlaceholder},
 * {@code timestamp}, {@code badges} (label/color chips; one whose text interpolates to blank is
 * hidden, like {@code @BadgeInHeader}), {@code kpis} (label/value facts), {@code peerNav}, the
 * {@code recordSwitcher}, {@code banners} and {@code fabs}. Texts may hold {@code ${state.x}} /
 * {@code ${data.x}}. They reach the wire with the very field names a reflected page's header has.
 */
@Builder
public record Form(
    String id,
    String title,
    String subtitle,
    boolean noHeader,
    Component avatar,
    @Singular("contentItem") List<Component> content,
    @Singular("headerItem") List<Component> header,
    @Singular("footerItem") List<Component> footer,
    @Singular("toolbarItem") List<UserTrigger> toolbar,
    @Singular List<UserTrigger> buttons,
    String style,
    String cssClasses,
    /** The small line of text above the title (Redwood's {@code overlineText}). */
    @Experimental("YAML page header (3.0 beta)") String overline,
    /** What the header shows while the title is still empty ("New booking…"). */
    @Experimental("YAML page header (3.0 beta)") String titlePlaceholder,
    /** The "last updated" line under the subtitle — the twin of a {@code @Timestamp} field. */
    @Experimental("YAML page header (3.0 beta)") String timestamp,
    /** Header chips — the twin of {@code @BadgeInHeader} / {@code BadgeSupplier}. */
    @Experimental("YAML page header (3.0 beta)") @Singular("badge") List<Chip> badges,
    /** Header key facts (label/value) — the twin of {@code @KPI}. */
    @Experimental("YAML page header (3.0 beta)") @Singular("kpi") List<Fact> kpis,
    /** Previous/next object arrows — the twin of {@code PeerNavigationSupplier}. */
    @Experimental("YAML page header (3.0 beta)") PeerNav peerNav,
    /** The record/context switcher — the twin of {@code RecordSwitcherSupplier}. */
    @Experimental("YAML page header (3.0 beta)") RecordSwitcher recordSwitcher,
    /** Banners under the header — the twin of {@code @Banner} / {@code BannerSupplier}. */
    @Experimental("YAML page header (3.0 beta)") @Singular("banner") List<PageBanner> banners,
    /** Page floating action buttons — the twin of {@code @Fab} methods on a page. */
    @Experimental("YAML page header (3.0 beta)") @Singular("fab") List<PageFab> fabs)
    implements Component, ContentSupplier, PageMainContent {

  public Form {
    content = content != null ? content : Collections.emptyList();
    header = header != null ? header : Collections.emptyList();
    footer = footer != null ? footer : Collections.emptyList();
    toolbar = toolbar != null ? toolbar : Collections.emptyList();
    buttons = buttons != null ? buttons : Collections.emptyList();
    badges = badges != null ? badges : Collections.emptyList();
    kpis = kpis != null ? kpis : Collections.emptyList();
    banners = banners != null ? banners : Collections.emptyList();
    fabs = fabs != null ? fabs : Collections.emptyList();
  }
}
