package io.mateu.core.infra.declarative.orchestrators.itemoverview;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;

/**
 * Item overview page (Redwood item-overview template): the item's key information stays pinned in a
 * left-hand panel while the rest of the page is organised in tabs on the right.
 *
 * <ul>
 *   <li>The first component field without {@link Panel} is the <b>key-info panel</b> (left,
 *       sticky).
 *   <li>Each component field annotated with {@link Panel} becomes a <b>tab</b> (label = {@code
 *       title}, defaulting to the field label).
 * </ul>
 *
 * Populate the fields in the constructor or field initializers. Override {@link #panelWidth()} to
 * change the key-info panel width.
 */
public abstract class ItemOverview implements ComponentTreeSupplier {

  /** CSS width of the left key-info panel. */
  protected String panelWidth() {
    return "22rem";
  }

  @Override
  public String style() {
    return null;
  }

  @Override
  @SneakyThrows
  public Component component(HttpRequest httpRequest) {
    Component keyInfo = null;
    List<Tab> tabs = new ArrayList<>();
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
        if (keyInfo == null) {
          keyInfo = component;
        }
        continue;
      }
      tabs.add(new Tab(!panel.title().isEmpty() ? panel.title() : getLabel(field), component));
    }
    List<Component> content = new ArrayList<>();
    if (keyInfo != null) {
      content.add(
          Card.builder()
              .id("key-info")
              .content(keyInfo)
              .style(
                  "flex: 0 0 "
                      + panelWidth()
                      + "; align-self: flex-start; position: sticky; top: 1rem;")
              .build());
    }
    content.add(
        TabLayout.builder().id("item-tabs").tabs(tabs).style("flex: 1; min-width: 0;").build());
    return HorizontalLayout.builder()
        .id(id())
        .content(content)
        .spacing(true)
        .fullWidth(true)
        .build();
  }
}
