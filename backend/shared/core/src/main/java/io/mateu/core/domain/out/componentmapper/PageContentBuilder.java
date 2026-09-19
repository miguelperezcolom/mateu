package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.isForm;
import static io.mateu.core.domain.out.componentmapper.PageListingBuilder.getCrud;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.data.ContentAsidePosition;
import io.mateu.uidl.data.GridTrack;
import io.mateu.uidl.data.HorizontalAlignment;
import io.mateu.uidl.data.ResponsiveGrid;
import io.mateu.uidl.data.Slotted;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ContentSupplier;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

final class PageContentBuilder {

  static Collection<? extends Component> getContent(
      Object instanceOrType,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    Object instance;
    if (instanceOrType instanceof Class<?> type) {
      try {
        instance = MateuBeanProvider.getBean(InstanceFactory.class).newInstance(type, httpRequest);
      } catch (java.lang.reflect.InvocationTargetException e) {
        // surface the constructor's real failure, not the reflective wrapper / lombok mask
        var cause = e.getCause() != null ? e.getCause() : e;
        if (cause instanceof RuntimeException re) {
          throw re;
        }
        if (cause instanceof Error err) {
          throw err;
        }
        throw new RuntimeException(cause);
      } catch (ReflectiveOperationException e) {
        throw new RuntimeException("Cannot instantiate " + type.getName(), e);
      }
    } else {
      instance = instanceOrType;
    }
    if (instance instanceof ContentSupplier contentSupplier) {
      return contentSupplier.content();
    }
    if (instance instanceof Listing<?> || instance instanceof ReactiveListing<?>) {
      return getCrud(instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (isApp(instance.getClass(), route)) {
      return List.of(
          mapToAppComponent(
              instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest));
    }
    if (isForm(instance)) {
      var form =
          getForm(
              instance,
              baseUrl,
              route,
              consumedRoute,
              initiatorComponentId,
              httpRequest,
              false,
              false,
              getFormColumns(instance.getClass()),
              0);
      return wrapAsideIfPresent(instance, form, baseUrl, route, initiatorComponentId, httpRequest);
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> !Modifier.isFinal(field.getModifiers()))
        .filter(
            field ->
                !MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Button.class)
                    && !MetaAnnotations.isPresent(field, Toolbar.class)
                    && !MetaAnnotations.isPresent(field, Header.class)
                    && !MetaAnnotations.isPresent(field, Footer.class)
                    && !MetaAnnotations.isPresent(field, Avatar.class)
                    && !MetaAnnotations.isPresent(field, Menu.class)
                    && !Status.class.equals(field.getType()))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  /**
   * If the form declares any {@link Aside} component-holder field, pull those out into the {@code
   * aside} slot of a "main aside" (or "aside main") named-slot template on the one responsive grid
   * (coherence-plan #7/#9) that wraps the rest of the form (the {@code main} slot) — the minimal
   * way to compose the Redwood content-page grammar from a plain form, retiring the bespoke
   * ContentLayout. The aside placement (side/width/sticky) comes from the FIRST {@code @Aside}
   * field. When no {@code @Aside} field exists the form is returned untouched (the common case,
   * zero overhead). Because a grid named area holds ONE item (multiple items in one area would
   * overlap), the form components and the aside components are each wrapped in a stretch {@link
   * VerticalLayout} — the same stacking a page gives its content — before being slotted.
   */
  private static Collection<? extends Component> wrapAsideIfPresent(
      Object instance,
      Collection<? extends Component> form,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var asideFields =
        getAllFields(instance.getClass()).stream()
            .filter(field -> MetaAnnotations.isPresent(field, Aside.class))
            .toList();
    if (asideFields.isEmpty()) {
      return form;
    }
    List<Component> aside = new ArrayList<>();
    for (var field : asideFields) {
      var value = getValue(field, instance); // ValueProvider unwraps Callable/Supplier holders
      if (value instanceof Component component) {
        aside.add(component);
      } else if (value != null) {
        aside.add(mapToComponent(value, baseUrl, route, initiatorComponentId, httpRequest));
      }
    }
    if (aside.isEmpty()) {
      return form;
    }
    var first = MetaAnnotations.find(asideFields.get(0), Aside.class);
    var width =
        first.width() != null && !first.width().isBlank() ? first.width() : DEFAULT_ASIDE_WIDTH;
    // Each region is wrapped in a stretch VerticalLayout so it is ONE grid item per named area.
    var mainSlot =
        new Slotted(
            "main",
            VerticalLayout.builder()
                .content(List.copyOf(form))
                .fullWidth(true)
                .horizontalAlignment(HorizontalAlignment.STRETCH)
                .spacing(true)
                .build());
    var asideSlot =
        new Slotted(
            "aside",
            VerticalLayout.builder()
                .content(aside)
                .fullWidth(true)
                .horizontalAlignment(HorizontalAlignment.STRETCH)
                .spacing(true)
                .build());
    boolean asideStart = first.position() == ContentAsidePosition.start;
    // aside on the start side → "aside main" with the fixed track first; on the end side → "main
    // aside" with the fixed track last. The main column fills; the aside column is fixed-width.
    var areas = asideStart ? "\"aside main\"" : "\"main aside\"";
    var columns =
        asideStart
            ? List.of(GridTrack.fixed(width), GridTrack.fill())
            : List.of(GridTrack.fill(), GridTrack.fixed(width));
    List<Component> slotted =
        asideStart ? List.of(asideSlot, mainSlot) : List.of(mainSlot, asideSlot);
    var stickyAreas = first.sticky() ? List.of("aside") : List.<String>of();
    return List.of(
        new ResponsiveGrid(
            "content", columns, null, slotted, null, "48rem", areas, stickyAreas, null));
  }

  /**
   * Default aside column width when {@code @Aside(width=...)} is blank (renderer's old default).
   */
  private static final String DEFAULT_ASIDE_WIDTH = "22rem";
}
