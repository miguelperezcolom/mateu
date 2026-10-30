package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.PageTemplateDto;
import io.mateu.dtos.TemplateImageDto;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CollectionDetailPage;
import io.mateu.uidl.data.DashboardLandingPage;
import io.mateu.uidl.data.DashboardLayout;
import io.mateu.uidl.data.FoldoutLayout;
import io.mateu.uidl.data.FoldoutPage;
import io.mateu.uidl.data.FoldoutPanel;
import io.mateu.uidl.data.GeneralOverviewPage;
import io.mateu.uidl.data.HeroSection;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.ItemOverviewPage;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Scoreboard;
import io.mateu.uidl.data.TemplateImage;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.data.WelcomePage;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormTemplate;
import java.util.ArrayList;
import java.util.List;

/**
 * A {@link Form} that fills a page template, laid out: the template's slots become ordinary
 * components — each in a container whose id names the slot — so every renderer draws the page, and
 * the template's own values travel on {@code FormDto.template} for a renderer that has the template
 * itself (Redwood paints Spectra's) and places each slot where it belongs.
 *
 * <p>The browser expander (libs/mateu {@code expander/pageTemplates.ts}) lays a statically bundled
 * page out the same way; keep both in step (pinned by Java goldens).
 */
public final class PageTemplates {

  static final String ITEM_OVERVIEW = "ItemOverviewPage";
  static final String WELCOME = "WelcomePage";
  static final String DASHBOARD = "DashboardLandingPage";
  static final String GENERAL_OVERVIEW = "GeneralOverviewPage";
  static final String COLLECTION_DETAIL = "CollectionDetailPage";
  static final String FOLDOUT = "FoldoutPage";

  private PageTemplates() {}

  /** The page's content: the template laid out, or the authored content of a free page. */
  static List<Component> contentOf(Form form) {
    if (form.template() instanceof ItemOverviewPage itemOverview) {
      return List.of(itemOverview(itemOverview, form.content()));
    }
    if (form.template() instanceof WelcomePage welcome) {
      return welcome(welcome, form);
    }
    if (form.template() instanceof DashboardLandingPage dashboard) {
      return dashboard(dashboard, form.content());
    }
    if (form.template() instanceof GeneralOverviewPage overview) {
      return List.of(generalOverview(overview, form.content()));
    }
    if (form.template() instanceof CollectionDetailPage collection) {
      return List.of(collectionDetail(collection, form.content()));
    }
    if (form.template() instanceof FoldoutPage foldout) {
      return List.of(foldout(foldout, form));
    }
    return form.content();
  }

  /**
   * Whether the template draws the page's header itself (its title, subtitle and actions live in
   * the template's banner): the form then carries no header and no toolbar of its own.
   */
  static boolean ownsHeader(Form form) {
    return form.template() instanceof WelcomePage;
  }

  /** The template's own values, for the wire; {@code null} for a free page. */
  static PageTemplateDto dtoOf(FormTemplate template) {
    if (template instanceof ItemOverviewPage itemOverview) {
      return new PageTemplateDto(
          ITEM_OVERVIEW, imageDto(itemOverview.avatar()), imageDto(itemOverview.photo()));
    }
    if (template instanceof WelcomePage) {
      return new PageTemplateDto(WELCOME, null, null);
    }
    if (template instanceof DashboardLandingPage) {
      return new PageTemplateDto(DASHBOARD, null, null);
    }
    if (template instanceof GeneralOverviewPage) {
      return new PageTemplateDto(GENERAL_OVERVIEW, null, null);
    }
    if (template instanceof CollectionDetailPage) {
      return new PageTemplateDto(COLLECTION_DETAIL, null, null);
    }
    if (template instanceof FoldoutPage) {
      return new PageTemplateDto(FOLDOUT, null, null);
    }
    return null;
  }

  private static TemplateImageDto imageDto(TemplateImage image) {
    return image == null ? null : new TemplateImageDto(image.src(), image.initials());
  }

  /**
   * Item overview: the overview panel (its image, its body and footer slots) beside the main slot.
   * The look here is Mateu's own drawing of the template for the renderers that do not have it — a
   * fixed-width panel pinned while the main area scrolls, wrapping under it on a narrow screen.
   */
  private static Component itemOverview(ItemOverviewPage template, List<Component> main) {
    List<Component> panel = new ArrayList<>();
    Component media = media(template);
    if (media != null) {
      panel.add(slot("item-overview-media", List.of(media), "width: 100%; align-items: center"));
    }
    panel.add(slot("item-overview-body", template.body(), "width: 100%"));
    if (!template.footer().isEmpty()) {
      panel.add(slot("item-overview-footer", template.footer(), "width: 100%"));
    }
    return HorizontalLayout.builder()
        .id("item-overview")
        .wrap(true)
        .spacing(true)
        .content(
            List.of(
                Card.builder()
                    .id("item-overview-panel")
                    .content(slot("item-overview-panel-content", panel, "width: 100%"))
                    .style(
                        "flex: 0 0 22rem; max-width: 100%; position: sticky; top: 0;"
                            + " align-self: flex-start")
                    .build(),
                VerticalLayout.builder()
                    .id("item-overview-main")
                    .content(main)
                    .style("flex: 1 1 24rem; min-width: min(24rem, 100%)")
                    .build()))
        .build();
  }

  /**
   * Welcome page: the banner (the form's title, subtitle and overline, its toolbar as the calls to
   * action) over the tiles — the same composition the {@code Welcome} archetype draws (a centred
   * {@link HeroSection}), so every renderer paints it and Redwood takes it for Spectra's template.
   */
  private static List<Component> welcome(WelcomePage template, Form form) {
    List<Component> ctas = new ArrayList<>();
    for (var trigger : form.toolbar()) {
      if (trigger instanceof Component component) ctas.add(component);
    }
    List<Component> page = new ArrayList<>();
    page.add(
        HeroSection.builder()
            .id("welcome")
            .title(form.title())
            .subtitle(form.subtitle())
            .overline(form.overline())
            .tone(template.toneOrNull())
            .centered(true)
            .content(ctas)
            .style("width: 100%; box-sizing: border-box; margin-bottom: 1rem")
            .build());
    page.addAll(form.content());
    return page;
  }

  /**
   * Dashboard landing page: the {@code kpi} slot's metrics as one {@link Scoreboard} band, over the
   * panels on the dashboard grid — the shape the {@code Dashboard} archetype composes (Redwood
   * paints it with Spectra's template). A non-metric component in the slot follows the band as it
   * is.
   */
  private static List<Component> dashboard(DashboardLandingPage template, List<Component> main) {
    List<Component> page = new ArrayList<>();
    List<MetricCard> metrics = new ArrayList<>();
    List<Component> others = new ArrayList<>();
    for (Component c : template.kpi()) {
      if (c instanceof MetricCard metric) metrics.add(metric);
      else others.add(c);
    }
    if (!metrics.isEmpty()) {
      page.add(Scoreboard.builder().id("dashboard-kpi").metrics(List.copyOf(metrics)).build());
    }
    page.addAll(others);
    page.add(DashboardLayout.builder().id("dashboard-panels").items(main).build());
    return page;
  }

  /**
   * General overview: the main slot (the form's content) and the complementary {@code info} panel
   * beside it, wrapping under it on a narrow screen — Mateu's own drawing for the renderers without
   * the template; Redwood reads the two slots by id and paints Spectra's.
   */
  private static Component generalOverview(GeneralOverviewPage template, List<Component> main) {
    List<Component> columns = new ArrayList<>();
    columns.add(
        slot("general-overview-main", main, "flex: 2 1 32rem; min-width: min(32rem, 100%)"));
    if (!template.info().isEmpty()) {
      columns.add(
          slot(
              "general-overview-info",
              template.info(),
              "flex: 1 1 16rem; min-width: min(16rem, 100%)"));
    }
    return HorizontalLayout.builder()
        .id("general-overview")
        .wrap(true)
        .spacing(true)
        .content(columns)
        .build();
  }

  /**
   * Collection detail: the collection ({@code list}) beside the selected item's detail (the form's
   * content) — or, when the page has no content, the {@code noSelection} slot.
   */
  private static Component collectionDetail(CollectionDetailPage template, List<Component> detail) {
    return HorizontalLayout.builder()
        .id("collection-detail")
        .wrap(true)
        .spacing(true)
        .content(
            List.of(
                slot("collection-detail-list", template.list(), "flex: 0 0 24rem; max-width: 100%"),
                detail.isEmpty()
                    ? slot(
                        "collection-detail-no-selection",
                        template.noSelection(),
                        "flex: 1 1 24rem; min-width: min(24rem, 100%)")
                    : slot(
                        "collection-detail-detail",
                        detail,
                        "flex: 1 1 24rem; min-width: min(24rem, 100%)")))
        .build();
  }

  /**
   * Foldout: one {@link FoldoutLayout} — the {@code overview} slot as its always-visible overview,
   * the form's {@link FoldoutPanel}s as its panels (any other content component becomes an untitled
   * panel). The page header stays the form's (its title is not repeated over the overview). Every
   * renderer already draws the layout.
   */
  private static Component foldout(FoldoutPage template, Form form) {
    List<FoldoutPanel> panels = new ArrayList<>();
    for (Component c : form.content()) {
      if (c instanceof FoldoutPanel panel) {
        panels.add(panel);
      } else {
        panels.add(
            FoldoutPanel.builder().id("panel" + panels.size()).open(true).content(c).build());
      }
    }
    return FoldoutLayout.builder()
        .id("foldout")
        .overview(slot("foldout-overview", template.overview(), "width: 100%"))
        .panels(panels)
        .orientation(template.orientation())
        .build();
  }

  /** The avatar (a round image, else the initials) or the 4:3 photo. */
  private static Component media(ItemOverviewPage template) {
    var avatar = template.avatar();
    if (avatar != null && avatar.src() != null && !avatar.src().isBlank()) {
      return new Image(
          avatar.src(),
          "width: 8rem; height: 8rem; border-radius: 50%; object-fit: cover",
          null,
          null);
    }
    if (avatar != null && avatar.initials() != null && !avatar.initials().isBlank()) {
      return new Avatar(null, avatar.initials(), null, "width: 8rem; height: 8rem", null);
    }
    var photo = template.photo();
    if (photo != null && photo.src() != null && !photo.src().isBlank()) {
      return new Image(
          photo.src(), "width: 100%; aspect-ratio: 4 / 3; object-fit: cover", null, null);
    }
    return null;
  }

  private static Component slot(String id, List<Component> content, String style) {
    return VerticalLayout.builder().id(id).content(content).style(style).build();
  }
}
