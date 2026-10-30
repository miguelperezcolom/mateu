package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.PageTemplateDto;
import io.mateu.dtos.TemplateImageDto;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.ItemOverviewPage;
import io.mateu.uidl.data.TemplateImage;
import io.mateu.uidl.data.VerticalLayout;
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

  private PageTemplates() {}

  /** The page's content: the template laid out, or the authored content of a free page. */
  static List<Component> contentOf(Form form) {
    if (form.template() instanceof ItemOverviewPage itemOverview) {
      return List.of(itemOverview(itemOverview, form.content()));
    }
    return form.content();
  }

  /** The template's own values, for the wire; {@code null} for a free page. */
  static PageTemplateDto dtoOf(FormTemplate template) {
    if (template instanceof ItemOverviewPage itemOverview) {
      return new PageTemplateDto(
          ITEM_OVERVIEW, imageDto(itemOverview.avatar()), imageDto(itemOverview.photo()));
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
