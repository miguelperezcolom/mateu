package io.mateu.uidl.data;

import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ContentSupplier;
import io.mateu.uidl.reflection.ComponentMapper;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import lombok.Builder;

@Builder
public record VerticalLayout(
    String id,
    List<Component> content,
    boolean spacing,
    boolean padding,
    boolean margin,
    SpacingVariant spacingVariant,
    HorizontalAlignment horizontalAlignment,
    HorizontalLayoutJustification justification,
    boolean wrap,
    List<Integer> flexGrows,
    boolean fullWidth,
    boolean hiddenOverflow,
    String style,
    String cssClasses)
    implements Component, ContentSupplier {

  public VerticalLayout(List<Component> content) {
    this(
        null, content, false, false, false, null, null, null, false, List.of(), false, false, "",
        "");
  }

  public VerticalLayout(Component... components) {
    this(
        null,
        List.of(components),
        false,
        false,
        false,
        null,
        null,
        null,
        false,
        List.of(),
        false,
        false,
        "",
        "");
  }

  public static VerticalLayout of(Object... content) {
    ComponentMapper componentMapper = MateuBeanProvider.getBean(ComponentMapper.class);
    List<Component> components =
        Arrays.stream(content)
            .map(componentMapper::mapToComponents)
            .flatMap(Collection::stream)
            .map(component -> (Component) component)
            .toList();
    return new VerticalLayout(components);
  }
}
