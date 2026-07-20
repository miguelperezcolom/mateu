package io.mateu.core.domain.out.fragmentmapper;

import static io.mateu.core.domain.out.fragmentmapper.mappers.AppMapper.mapAppToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ComponentTreeSupplierMapper.mapComponentTreeSupplierToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CrudlMapper.mapCrudlToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FieldMapper.mapFormFieldToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormMapper.mapFormToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FutureComponentMapper.mapFutureComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.PageMapper.mapPageToDto;

import io.mateu.core.domain.out.componentmapper.PageTypeResolver;
import io.mateu.core.domain.out.componentmapper.PageWidthResolver;
import io.mateu.core.domain.out.componentmapper.ReflectionPageMapper;
import io.mateu.core.domain.out.componentmapper.ViewTypeClassifier;
import io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper;
import io.mateu.core.domain.out.fragmentmapper.mappers.EmitsMapper;
import io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper;
import io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper;
import io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.ConfirmOnNavigationIfDirty;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.DtoSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class ComponentToFragmentDtoMapper {

  public static ComponentDto mapComponentToDto(
      ComponentTreeSupplier componentSupplier,
      Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component == null && componentSupplier != null) {
      if (componentSupplier instanceof DtoSupplier dtoSupplier) {
        return dtoSupplier.dto(httpRequest);
      }
      return mapComponentTreeSupplierToDto(
          componentSupplier, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof ServerSideComponent serverSideComponent) {
      return ServerSideComponentDto.builder()
          .id(serverSideComponent.id())
          .serverSideType(serverSideComponent.serverSideType())
          .route(serverSideComponent.route())
          .emitsName(serverSideComponent.emitsName())
          .initialData(serverSideComponent.initialData())
          .style(serverSideComponent.style())
          .cssClasses(serverSideComponent.cssClasses())
          .actions(serverSideComponent.actions().stream().map(ActionMapper::mapAction).toList())
          .triggers(serverSideComponent.triggers().stream().map(TriggerMapper::mapTrigger).toList())
          .rules(serverSideComponent.rules().stream().map(RuleMapper::mapToRule).toList())
          .validations(
              serverSideComponent.validations().stream()
                  .map(ValidationMapper::mapToValidation)
                  .toList())
          .children(
              serverSideComponent.children().stream()
                  .map(
                      child ->
                          mapComponentToDto(
                              null,
                              child,
                              baseUrl,
                              route,
                              consumedRoute,
                              initiatorComponentId,
                              httpRequest))
                  .toList())
          .build();
    }
    if (component == null) {
      return null;
    }
    if (component instanceof ModelViewComponent modelViewComponent) {
      var view = modelViewComponent.modelView();
      if (view instanceof Component c) {
        return mapComponentToDto(
            null, c, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
      }
      if (view != null && ViewTypeClassifier.isPage(view, route)) {
        var pageView =
            ReflectionPageMapper.mapToPageComponent(
                view, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
        return mapPageToDto(
            pageView, null, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
      }
    }
    if (component instanceof EmbeddedView embeddedView) {
      var view = embeddedView.view();
      if (view instanceof Component c) {
        return mapComponentToDto(
            null, c, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
      }
      // A routed model view (e.g. a Wizard) embedded as an INDEPENDENT server-side component: wrap
      // its page in a ServerSideComponentDto carrying the view's own serverSideType + actions, so
      // its actions (a wizard's step navigation) route back to itself instead of bubbling to the
      // host. This is what makes a wizard-in-a-drawer navigate (the Guided Process Drawer pattern).
      var pageView =
          ReflectionPageMapper.mapToPageComponent(
              view, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
      var page =
          mapComponentToDto(
              null, pageView, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
      return new ServerSideComponentDto(
          UUID.randomUUID().toString(),
          view.getClass().getName(),
          consumedRoute,
          List.of(page),
          view,
          "",
          "",
          ActionMapper.mapActions(view, httpRequest),
          TriggerMapper.mapTriggers(view, httpRequest),
          RuleMapper.mapRules(view, httpRequest),
          ValidationMapper.mapValidations(view, route),
          null,
          null,
          MetaAnnotations.isPresent(view.getClass(), ConfirmOnNavigationIfDirty.class),
          EmitsMapper.emitsName(view),
          PageWidthResolver.wirePageWidth(view),
          PageTypeResolver.wirePageType(view));
    }
    if (component instanceof FutureComponent futureComponent) {
      return mapFutureComponentToDto(
          futureComponent, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof ComponentTreeSupplier componentTreeSupplier) {
      if (componentSupplier instanceof DtoSupplier dtoSupplier) {
        return dtoSupplier.dto(httpRequest);
      }
      // a component that IS a DtoSupplier (an orchestrator dropped into a component tree or a
      // composite page) maps through its own dto — component() would throw
      if (component instanceof DtoSupplier dtoSupplier) {
        return dtoSupplier.dto(httpRequest);
      }
      return mapComponentTreeSupplierToDto(
          componentTreeSupplier, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof PageView page) {
      return mapPageToDto(
          page,
          componentSupplier,
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
    }
    if (component instanceof AppShell app) {
      return mapAppToDto(
          componentSupplier, app, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Form form) {
      return mapFormToDto(
          form,
          componentSupplier,
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
    }
    if (component instanceof Listing crudl) {
      return mapCrudlToDto(
          crudl,
          componentSupplier,
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
    }
    if (component instanceof FormField formField) {
      return mapFormFieldToDto(
          formField, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }

    var result =
        LayoutComponentDispatcher.dispatch(
            component, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    if (result != null) return result;

    result =
        DisplayComponentDispatcher.dispatch(
            component, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    if (result != null) return result;

    result =
        WidgetComponentDispatcher.dispatch(
            component, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    if (result != null) return result;

    result =
        OverlayComponentDispatcher.dispatch(
            component, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    if (result != null) return result;

    return new ClientSideComponentDto(
        new ElementDto("div", Map.of(), Map.of(), component.toString()),
        UUID.randomUUID().toString(),
        List.of(),
        component.style(),
        component.cssClasses(),
        null);
  }
}
