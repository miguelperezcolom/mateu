package io.mateu.core.infra.declarative.orchestrators.foldout;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.FoldoutLayout;
import io.mateu.uidl.data.FoldoutPanel;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;

/**
 * Declarative Redwood-style foldout page: a fixed overview panel on the left plus lateral fold-out
 * panels with categories of associated information.
 *
 * <ul>
 *   <li>The first component field without {@link Panel} is the <b>overview</b> (always visible).
 *   <li>Each component field annotated with {@link Panel} becomes a fold-out panel (title defaults
 *       to the field label; {@code open} controls the initial state).
 * </ul>
 *
 * Populate the fields in the constructor or field initializers.
 */
public abstract class Foldout implements ComponentTreeSupplier {

  @Override
  public String style() {
    return null;
  }

  @Override
  @SneakyThrows
  public Component component(HttpRequest httpRequest) {
    Component overview = null;
    List<FoldoutPanel> panels = new ArrayList<>();
    for (Field field : getClass().getDeclaredFields()) {
      if (Modifier.isStatic(field.getModifiers())) {
        continue;
      }
      field.setAccessible(true);
      Object value = field.get(this);
      if (!(value instanceof Component component)) {
        continue;
      }
      Panel panel = MetaAnnotations.find(field, Panel.class);
      if (panel == null) {
        if (overview == null) {
          overview = component;
        }
        continue;
      }
      panels.add(
          FoldoutPanel.builder()
              .id(field.getName())
              .title(!panel.title().isEmpty() ? panel.title() : getLabel(field))
              .subtitle(!panel.subtitle().isEmpty() ? panel.subtitle() : null)
              .icon(!panel.icon().isEmpty() ? panel.icon() : null)
              .open(panel.open())
              .content(component)
              .build());
    }
    return FoldoutLayout.builder().id(id()).overview(overview).panels(panels).build();
  }
}
