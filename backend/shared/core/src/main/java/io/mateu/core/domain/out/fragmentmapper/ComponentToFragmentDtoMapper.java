package io.mateu.core.domain.out.fragmentmapper;

import static io.mateu.core.domain.out.fragmentmapper.mappers.AppMapper.mapAppToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ComponentTreeSupplierMapper.mapComponentTreeSupplierToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CrudlMapper.mapCrudlToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FieldMapper.mapFormFieldToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormMapper.mapFormToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.PageMapper.mapPageToDto;

import io.mateu.core.domain.out.componentmapper.PageTypeResolver;
import io.mateu.core.domain.out.componentmapper.PageWidthResolver;
import io.mateu.core.domain.out.componentmapper.ReflectionPageMapper;
import io.mateu.core.domain.out.componentmapper.StaticViewResolver;
import io.mateu.core.domain.out.componentmapper.ViewTypeClassifier;
import io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper;
import io.mateu.core.domain.out.fragmentmapper.mappers.EmitsMapper;
import io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper;
import io.mateu.core.domain.out.fragmentmapper.mappers.TreeActionHarvester;
import io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper;
import io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper;
import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
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
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class ComponentToFragmentDtoMapper {

  /**
   * A wizard in a drawer (the "Guided Process Drawer" UX pattern) suits SHORT subflows — up to 5
   * steps. A longer one should be a routed page: the full-page Guided Process is a routed {@code
   * Wizard} with {@code @WizardProgress(RAIL)}. (Renderers draw the drawer's wizard as a generic
   * wizard — Redwood with its step train — not as Redwood's guided-process template.) We warn once
   * per wizard class rather than failing: the drawer still works, it just isn't the recommended
   * surface.
   */
  private static final int MAX_GUIDED_PROCESS_DRAWER_STEPS = 5;

  private static final Set<String> warnedLongEmbeddedWizards = ConcurrentHashMap.newKeySet();

  /** Component types already reported as unrenderable, so the warning is logged once each. */
  private static final Set<String> warnedUnrenderableComponents = ConcurrentHashMap.newKeySet();

  /** The page types of the composed archetypes, which draw no heading of their own. */
  private static final java.util.Set<String> COMPOSED_PAGE_TYPES =
      java.util.Set.of("dashboard", "collection", "detail");

  /**
   * A composed archetype (a {@code Dashboard}, a {@code CollectionDetail}…) draws no heading: when
   * ROUTED the web shows the window title above it. EMBEDDED in another page the window title is
   * the HOST's, so the island names itself instead — its declared title (never one derived from the
   * class name) as an h2 opening its tree. Nothing changes when it already has a heading of its
   * own.
   */
  private static ComponentDto withOwnHeading(
      ComponentDto dto,
      Object view,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (!(dto instanceof ServerSideComponentDto island)
        || island.pageType() == null
        || !COMPOSED_PAGE_TYPES.contains(island.pageType())) {
      return dto;
    }
    var title = ReflectionPageMapper.getDeclaredTitle(view);
    if (title == null || title.isBlank()) {
      return dto;
    }
    var heading =
        mapComponentToDto(
            null,
            io.mateu.uidl.data.Text.builder()
                .id(island.id() + "-page-title")
                .text(title)
                .container(io.mateu.uidl.data.TextContainer.h2)
                .variants(List.of())
                .style("")
                .cssClasses("")
                .attributes(java.util.Map.of())
                .build(),
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest);
    var children = new java.util.ArrayList<ComponentDto>();
    children.add(heading);
    if (island.children() != null) {
      children.addAll(island.children());
    }
    return island.withChildren(children);
  }

  /**
   * The archetype bridge page-level inference substitutes for a plain class (the same rule {@code
   * ReflectionUiIncrementMapper} applies to a routed one), or null when it composes nothing.
   */
  static Component inferredPage(Object view) {
    if (io.mateu.core.domain.out.componentmapper.PageInference.composesDashboard(view.getClass())) {
      return new io.mateu.core.infra.declarative.orchestrators.dashboard.InferredDashboard(view);
    }
    if (io.mateu.core.domain.out.componentmapper.PageInference.composesWelcome(view.getClass())) {
      return new io.mateu.core.infra.declarative.orchestrators.welcome.InferredWelcome(view);
    }
    return null;
  }

  /**
   * The data an embedded view renders with, as its page's fragment would carry it; null if none.
   */
  static Object islandData(Object view, HttpRequest httpRequest) {
    Object data =
        view instanceof io.mateu.uidl.interfaces.DataSupplier dataSupplier
            ? dataSupplier.data(httpRequest)
            : io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.createData(
                view, httpRequest);
    return data instanceof java.util.Map<?, ?> map && map.isEmpty() ? null : data;
  }

  private static void warnIfGuidedProcessDrawerTooLong(Object view) {
    if (!(view instanceof Wizard wizard)) {
      return;
    }
    // numberOfSteps() counts the trailing read-only result step too, so real steps = total - 1.
    var realSteps = wizard.numberOfSteps() - 1;
    if (realSteps > MAX_GUIDED_PROCESS_DRAWER_STEPS
        && warnedLongEmbeddedWizards.add(wizard.getClass().getName())) {
      log.warn(
          "Wizard {} is shown in a drawer with {} steps; a wizard in a drawer suits short"
              + " sub-flows (<= {} steps). Consider a full-page Guided Process for longer flows: a"
              + " routed Wizard with @WizardProgress(RAIL).",
          wizard.getClass().getName(),
          realSteps,
          MAX_GUIDED_PROCESS_DRAWER_STEPS);
    }
  }

  /**
   * The business components being resolved on the way down this thread's mapping, outermost first.
   * A composition that references itself — directly, through another component, or through a
   * partial — closes a cycle; without this the mapping recursed until a StackOverflowError.
   */
  private static final ThreadLocal<java.util.Deque<String>> RESOLVING =
      ThreadLocal.withInitial(java.util.ArrayDeque::new);

  /** A ref chain longer than this is a bug, not a design (same bound as partials). */
  private static final int MAX_COMPONENT_REF_DEPTH = 20;

  private static ComponentDto mapComponentRef(
      io.mateu.uidl.data.ComponentRef ref,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var chain = RESOLVING.get();
    var name = ref.ref() == null ? "" : ref.ref();
    if (chain.contains(name) || chain.size() >= MAX_COMPONENT_REF_DEPTH) {
      var path = new java.util.ArrayList<>(chain);
      java.util.Collections.reverse(path);
      path.add(name);
      log.error(
          "Business component '{}' includes itself: {}; rendered as a placeholder",
          name,
          String.join(" -> ", path));
      return mapComponentToDto(
          null,
          new io.mateu.uidl.data.Text("Unknown business component: " + name),
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
    }
    var registry =
        io.mateu.uidl.di.MateuBeanProvider.getBean(
            io.mateu.core.application.runaction.ComponentRegistry.class);
    var entry =
        registry == null
            ? java.util.Optional.<io.mateu.uidl.data.ComponentEntry>empty()
            : registry.get(name);
    var resolved =
        entry
            .map(io.mateu.uidl.data.ComponentEntry::component)
            .filter(java.util.Objects::nonNull)
            // a partial inside a composition is resolved like one anywhere else in a tree
            .map(c -> io.mateu.core.application.runaction.PartialExpander.expand(c, httpRequest))
            .orElseGet(() -> new io.mateu.uidl.data.Text("Unknown business component: " + name));
    chain.push(name);
    try {
      return mapComponentToDto(
          null, resolved, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    } finally {
      chain.pop();
    }
  }

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
    // A reference to a named business component (coherence-plan #13): substitute the catalogue
    // entry's composition and map THAT. The server resolves it here so a backend-driven app never
    // ships the reference; when no backend is present it reaches the wire and the client-side
    // expander resolves it against the shipped catalogue. An unknown name is a graceful
    // placeholder,
    // never an error.
    if (component instanceof io.mateu.uidl.data.ComponentRef ref) {
      return mapComponentRef(ref, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof ServerSideComponent serverSideComponent) {
      return ServerSideComponentDto.builder()
          .id(serverSideComponent.id())
          .serverSideType(serverSideComponent.serverSideType())
          .route(serverSideComponent.route())
          .emitsName(serverSideComponent.emitsName())
          .confirmOnNavigationIfDirty(serverSideComponent.confirmOnNavigationIfDirty())
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
        return withOwnHeading(
            mapComponentToDto(
                null, c, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest),
            view,
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest);
      }
      if (view != null && ViewTypeClassifier.isPage(view, route)) {
        var pageView =
            ReflectionPageMapper.mapToPageComponent(
                view, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
        return mapPageToDto(
            pageView, null, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
      }
    }
    if ((component instanceof EmbeddedView embedded && embedded.view() == null)
        || (component instanceof FutureComponent future && future.instance() == null)) {
      // nothing to embed (a definition naming no view): an empty slot, not an exception
      return mapComponentToDto(
          null,
          new io.mateu.uidl.data.Div(List.of()),
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
    }
    if (component instanceof EmbeddedView embeddedView) {
      var view = embeddedView.view();
      // an orchestrator (a crud…) is a mediator island routed relative to ITSELF — mapped through
      // its own dto() it was bound to the host's route and loaded the host inside itself
      if (view instanceof io.mateu.core.infra.declarative.orchestrators.MultiView) {
        return mapComponentToDto(
            null,
            io.mateu.core.domain.out.componentmapper.EmbeddedOrchestratorFieldBuilder.embedded(
                view, initiatorComponentId, httpRequest),
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest);
      }
      if (view instanceof Component c) {
        return withOwnHeading(
            mapComponentToDto(
                null, c, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest),
            view,
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest);
      }
      // an object a ComponentAdapter renders is drawn BY THE ADAPTER, as it is as a route or a form
      // field: the bridge is an island of the adapted model (its type, state and actions). It used
      // to be reflected field by field — no adapter components, labels or actions.
      var adapter = io.mateu.core.infra.adapters.AdapterRegistry.find(view.getClass());
      if (adapter != null) {
        return mapComponentToDto(
            null,
            new io.mateu.core.infra.adapters.AdaptedComponentTree(view, adapter),
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest);
      }
      // page-level inference (@AutoPage) composes the class as it does on a page of its own: a
      // plain class of metric cards is a dashboard island, and its cards' actions are advertised
      // (reflected as a form, the cards were fields and a click on one sent nothing)
      var inferred = inferredPage(view);
      if (inferred != null) {
        return mapComponentToDto(
            null, inferred, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
      }
      warnIfGuidedProcessDrawerTooLong(view);
      // A routed model view (e.g. a Wizard) embedded as an INDEPENDENT server-side component: wrap
      // its page in a ServerSideComponentDto carrying the view's own serverSideType + actions, so
      // its actions (a wizard's step navigation) route back to itself instead of bubbling to the
      // host. This is what makes a wizard-in-a-drawer navigate (the Guided Process Drawer pattern).
      var pageView =
          ReflectionPageMapper.mapToPageComponent(
              view, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
      // an island is a block of the host page, not a page: the automatic breadcrumb trail would
      // trace the HOST's menu and address above it (a trail the view DECLARES is still drawn)
      pageView = pageView.toBuilder().noBreadcrumbs(Boolean.TRUE).build();
      var page =
          mapComponentToDto(
              null, pageView, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
      // the client names this type back on every action of the embedded view (a listing's first
      // search, a form's save): remember that this process handed it out — a view reachable from no
      // routed page (a Listing built for a drawer) was refused by the wire type policy otherwise
      io.mateu.core.application.security.WireTypes.emitted(view.getClass().getName());
      return new ServerSideComponentDto(
          UUID.randomUUID().toString(),
          view.getClass().getName(),
          consumedRoute,
          List.of(page),
          // The state as every page serialises it — field by field, not the object handed to the
          // JSON writer, which only sees what has a getter: a form without them travelled empty.
          io.mateu.core.domain.ComponentState.getState(view, httpRequest),
          "",
          "",
          TreeActionHarvester.withTreeActions(
              ActionMapper.mapActions(view, httpRequest), view, page, httpRequest),
          TriggerMapper.mapTriggers(view, httpRequest),
          RuleMapper.mapRules(view, httpRequest),
          ValidationMapper.mapValidations(view, route, httpRequest),
          null,
          null,
          MetaAnnotations.isPresent(view.getClass(), ConfirmOnNavigationIfDirty.class),
          EmitsMapper.emitsName(view),
          PageWidthResolver.wirePageWidth(view),
          PageTypeResolver.wirePageType(view),
          StaticViewResolver.isStatic(view),
          null,
          // what a page of its own carries in its fragment's data (a lookup's label…): the island
          // has no fragment, so it travels with it — the stored id used to be shown raw
          islandData(view, httpRequest));
    }
    if (component instanceof FutureComponent futureComponent) {
      // the same island as an EmbeddedView: the instance's own tree (a component tree's
      // component()), its state field by field and its own actions. It used to be rendered
      // reflectively with the raw object as its state and no actions.
      return mapComponentToDto(
          null,
          new EmbeddedView(futureComponent.instance()),
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
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

    // Nothing knows how to render this component. That is a bug in the component or in the mapper,
    // so it is reported to the DEVELOPER — once per type, since it would otherwise repeat on every
    // render — instead of dumping the object's Java toString on the user's screen, which is how a
    // "Process not found" once reached a page as
    // "Data[data={error=Process not found}, style=, cssClasses=, newState=null]".
    if (warnedUnrenderableComponents.add(component.getClass().getName())) {
      log.warn(
          "No mapper renders {} — it is emitted as an empty element. If it is meant to appear on a"
              + " page, it needs a mapper; if it is a wire fragment (Data, State), it must be"
              + " returned from an action, not from a view.",
          component.getClass().getName());
    }
    return new ClientSideComponentDto(
        new ElementDto("div", Map.of(), Map.of(), ""),
        UUID.randomUUID().toString(),
        List.of(),
        component.style(),
        component.cssClasses(),
        null);
  }

  /**
   * The content of an overlay (a dialog, a drawer): a form in it is a component of its OWN.
   *
   * <p>A {@link io.mateu.uidl.data.ModelViewComponent} draws its view as part of the component
   * around it — right for a piece of a page, wrong for an overlay, where that component is the page
   * BEHIND: the form's state never reached the browser, so its fields came up empty, and its
   * buttons ran on the page behind, which knows nothing of them. So a view that is not already a
   * component is embedded instead ({@link io.mateu.uidl.data.EmbeddedView}), with its own state and
   * its own actions.
   */
  public static io.mateu.uidl.fluent.Component overlayContent(
      io.mateu.uidl.fluent.Component content) {
    if (content instanceof io.mateu.uidl.data.ModelViewComponent modelView
        && modelView.modelView() != null
        && !(modelView.modelView() instanceof io.mateu.uidl.fluent.Component)) {
      return new io.mateu.uidl.data.EmbeddedView(modelView.modelView());
    }
    return content;
  }
}
