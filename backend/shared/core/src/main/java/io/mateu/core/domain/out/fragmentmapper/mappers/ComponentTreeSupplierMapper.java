package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.ComponentState.getState;
import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.core.application.runaction.PartialExpander;
import io.mateu.core.domain.act.FluentHandlerButtons;
import io.mateu.core.domain.out.componentmapper.PageTypeResolver;
import io.mateu.core.domain.out.componentmapper.PageWidthResolver;
import io.mateu.core.domain.out.componentmapper.SizingResolver;
import io.mateu.core.domain.out.componentmapper.StaticViewResolver;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.UUID;

public class ComponentTreeSupplierMapper {

  public static ComponentDto mapComponentTreeSupplierToDto(
      ComponentTreeSupplier componentTreeSupplier,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var tree =
        withPageBars(
            componentTreeSupplier, componentTreeSupplier.component(httpRequest), httpRequest);
    var leaf =
        mapComponentToDto(
            componentTreeSupplier,
            PartialExpander.expand(tree, httpRequest),
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest);
    // An explicit @Size on the view sizes its whole surface (coherence-plan #8): e.g. a full-canvas
    // screen that should fill the viewport and scroll internally. It overrides any inferred sizing.
    var sizing = SizingResolver.wireSizing(componentTreeSupplier.getClass());
    if (sizing != null && leaf instanceof ClientSideComponentDto client) {
      leaf = client.withSizing(sizing);
    }
    return new ServerSideComponentDto(
        UUID.randomUUID().toString(),
        componentTreeSupplier.serverSideType(),
        consumedRoute,
        List.of(leaf),
        getState(componentTreeSupplier, httpRequest),
        componentTreeSupplier.style(),
        componentTreeSupplier.cssClasses(),
        TreeActionHarvester.withTreeActions(
            ActionMapper.mapActions(componentTreeSupplier, httpRequest),
            componentTreeSupplier,
            leaf,
            httpRequest,
            // the buttons ComponentTreeActionRunner runs by id: no method backs them
            FluentHandlerButtons.ids(tree)),
        TriggerMapper.mapTriggers(componentTreeSupplier, httpRequest),
        RuleMapper.mapRules(componentTreeSupplier, httpRequest),
        ValidationMapper.mapValidations(componentTreeSupplier, route, httpRequest),
        null,
        null,
        false,
        EmitsMapper.emitsName(componentTreeSupplier),
        PageWidthResolver.wirePageWidth(componentTreeSupplier),
        PageTypeResolver.wirePageType(componentTreeSupplier),
        StaticViewResolver.isStatic(componentTreeSupplier),
        null);
  }

  /**
   * The routed page of a view that builds its own tree (an {@code ItemOverview}, any {@code
   * ComponentTreeSupplier}) gets the same bars a normal page has: its {@code @Toolbar} and
   * {@code @Button} methods and fields — dispatched to it like a normal page's — and the CRUD
   * navigation of a page overriding a CRUD's sub-screen. They were ignored: the tree was all there
   * was. The tree goes inside a page that carries them (a tree that IS a page gets them added); a
   * view with none of them renders exactly as before.
   */
  static io.mateu.uidl.fluent.Component withPageBars(
      ComponentTreeSupplier view, io.mateu.uidl.fluent.Component tree, HttpRequest httpRequest) {
    if (tree == null || !io.mateu.core.domain.RoutedView.is(view, httpRequest)) {
      return tree;
    }
    var toolbar =
        io.mateu.core.domain.CrudNavigation.withToolbar(
            view,
            httpRequest,
            io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.toolbarOf(
                view, httpRequest));
    var buttons =
        io.mateu.core.domain.CrudNavigation.withButtons(
            view,
            httpRequest,
            io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.buttonsOf(
                view, httpRequest));
    if (toolbar.isEmpty() && buttons.isEmpty()) {
      return tree;
    }
    if (tree instanceof io.mateu.uidl.fluent.PageView page) {
      var mergedToolbar = new java.util.ArrayList<io.mateu.uidl.fluent.UserTrigger>();
      if (page.toolbar() != null) mergedToolbar.addAll(page.toolbar());
      mergedToolbar.addAll(toolbar);
      var mergedButtons = new java.util.ArrayList<io.mateu.uidl.fluent.UserTrigger>();
      if (page.buttons() != null) mergedButtons.addAll(page.buttons());
      mergedButtons.addAll(buttons);
      return page.toBuilder()
          .clearToolbar()
          .toolbar(mergedToolbar)
          .clearButtons()
          .buttons(mergedButtons)
          .build();
    }
    return io.mateu.uidl.fluent.PageView.builder()
        .toolbar(toolbar)
        .buttons(buttons)
        .content(java.util.List.of(tree))
        .build();
  }
}
