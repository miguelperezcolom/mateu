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
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;

/**
 * The {@link Welcome} composition, extracted so it works over ANY instance declaring the same field
 * conventions: {@link Button} fields become call-to-action buttons inside a centered hero,
 * {@code @Panel} component fields become highlight tiles on a grid below. Used by the {@link
 * Welcome} archetype (subclassing) and by page-level inference ({@code @AutoPage}) to render a
 * plain class as a landing page.
 */
public final class WelcomeComposer {

  @SneakyThrows
  public static Component compose(
      Object host, String id, String heroTitle, String heroSubtitle, String heroImage) {
    List<Component> ctas = new ArrayList<>();
    List<Component> tiles = new ArrayList<>();
    for (Field field : host.getClass().getDeclaredFields()) {
      if (Modifier.isStatic(field.getModifiers())) {
        continue;
      }
      field.setAccessible(true);
      Object value = field.get(host);
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
            .title(heroTitle)
            .subtitle(heroSubtitle)
            .image(heroImage)
            .centered(true)
            .content(ctas)
            .build());
    if (!tiles.isEmpty()) {
      content.add(DashboardLayout.builder().id("highlights").items(tiles).build());
    }
    return VerticalLayout.builder()
        .id(id)
        .content(content)
        .fullWidth(true)
        .horizontalAlignment(HorizontalAlignment.STRETCH)
        .spacing(true)
        .build();
  }

  private WelcomeComposer() {}
}
