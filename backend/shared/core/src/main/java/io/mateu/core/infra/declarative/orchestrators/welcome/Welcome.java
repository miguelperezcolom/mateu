package io.mateu.core.infra.declarative.orchestrators.welcome;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.DashboardLayout;
import io.mateu.uidl.data.DashboardPanel;
import io.mateu.uidl.data.HeroSection;
import io.mateu.uidl.data.HorizontalAlignment;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;

/**
 * Welcome page: a friendly introduction to a flow — a big hero (title, subtitle, optional
 * background image) with call-to-action buttons, plus a grid of highlight tiles below.
 *
 * <ul>
 *   <li>{@link Button} fields become <b>call-to-action buttons</b> inside the hero. Their {@code
 *       actionId} runs the matching {@code @Action} method (return a {@code URI} to navigate).
 *   <li>Component fields annotated with {@link Panel} become <b>highlight tiles</b> on a responsive
 *       grid below.
 *   <li>Any other component field is placed on the grid as-is.
 * </ul>
 *
 * Override {@link #heroTitle()}, {@link #heroSubtitle()} and {@link #heroImage()} for the hero
 * chrome.
 */
public abstract class Welcome implements ComponentTreeSupplier {

  protected String heroTitle() {
    return null;
  }

  protected String heroSubtitle() {
    return null;
  }

  /** Optional background image URL for the hero. */
  protected String heroImage() {
    return null;
  }

  @Override
  public String style() {
    return null;
  }

  @Override
  @SneakyThrows
  public Component component(HttpRequest httpRequest) {
    List<Component> ctas = new ArrayList<>();
    List<Component> tiles = new ArrayList<>();
    for (Field field : getClass().getDeclaredFields()) {
      if (Modifier.isStatic(field.getModifiers())) {
        continue;
      }
      field.setAccessible(true);
      Object value = field.get(this);
      if (value instanceof Button button) {
        ctas.add(button);
        continue;
      }
      if (!(value instanceof Component component)) {
        continue;
      }
      Panel panel = MetaAnnotations.find(field, Panel.class);
      if (panel != null) {
        tiles.add(
            DashboardPanel.builder()
                .id(field.getName())
                .title(!panel.title().isEmpty() ? panel.title() : getLabel(field))
                .subtitle(!panel.subtitle().isEmpty() ? panel.subtitle() : null)
                .colSpan(panel.colSpan())
                .rowSpan(panel.rowSpan())
                .content(component)
                .build());
      } else {
        tiles.add(component);
      }
    }
    List<Component> content = new ArrayList<>();
    content.add(
        HeroSection.builder()
            .id("hero")
            .title(heroTitle())
            .subtitle(heroSubtitle())
            .image(heroImage())
            .centered(true)
            .content(ctas)
            .build());
    if (!tiles.isEmpty()) {
      content.add(DashboardLayout.builder().id("highlights").items(tiles).build());
    }
    return VerticalLayout.builder()
        .id(id())
        .content(content)
        .fullWidth(true)
        .horizontalAlignment(HorizontalAlignment.STRETCH)
        .spacing(true)
        .build();
  }
}
