package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.ComponentState.getState;
import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.core.application.runaction.PartialExpander;
import io.mateu.core.domain.act.FluentHandlerButtons;
import io.mateu.core.domain.out.componentmapper.PageTypeResolver;
import io.mateu.core.domain.out.componentmapper.PageWidthResolver;
import io.mateu.core.domain.out.componentmapper.ReflectionPageMapper;
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
            componentTreeSupplier,
            componentTreeSupplier.component(httpRequest),
            baseUrl,
            route,
            initiatorComponentId,
            httpRequest);
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
   * was. Likewise the canonical header pieces a reflected page reads ({@code @Subtitle},
   * {@code @Overline}, {@code @Timestamp}, {@code @KPI}, {@code @BadgeInHeader}, {@code @Avatar},
   * {@code @Banner}, peer navigation, a record switcher — {@link ReflectionPageMapper#headerOf}).
   * The tree goes inside a page that carries them (a tree that IS a page gets them added), titled
   * with the view's title unless the tree already names itself; a view with none of them renders
   * exactly as before. For a bridge ({@code @AutoPage}) the page belongs to the model behind it.
   */
  static io.mateu.uidl.fluent.Component withPageBars(
      ComponentTreeSupplier view,
      io.mateu.uidl.fluent.Component tree,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var owner = io.mateu.core.infra.ModelBridge.ownerOf(view);
    if (tree == null || !io.mateu.core.domain.RoutedView.is(owner, httpRequest)) {
      return tree;
    }
    var toolbar =
        io.mateu.core.domain.CrudNavigation.withToolbar(
            owner, httpRequest, ReflectionPageMapper.toolbarOf(owner, httpRequest));
    var buttons =
        io.mateu.core.domain.CrudNavigation.withButtons(
            owner, httpRequest, ReflectionPageMapper.buttonsOf(owner, httpRequest));
    var opensWithHero = SelfNamingTree.opensWithHero(tree);
    var header =
        ReflectionPageMapper.headerOf(
            owner, !opensWithHero, baseUrl, route, initiatorComponentId, httpRequest);
    if (toolbar.isEmpty() && buttons.isEmpty() && header == null) {
      return tree;
    }
    if (tree instanceof io.mateu.uidl.fluent.PageView page) {
      var mergedToolbar = new java.util.ArrayList<io.mateu.uidl.fluent.UserTrigger>();
      if (page.toolbar() != null) mergedToolbar.addAll(page.toolbar());
      mergedToolbar.addAll(toolbar);
      var mergedButtons = new java.util.ArrayList<io.mateu.uidl.fluent.UserTrigger>();
      if (page.buttons() != null) mergedButtons.addAll(page.buttons());
      mergedButtons.addAll(buttons);
      var merged =
          page.toBuilder()
              .clearToolbar()
              .toolbar(mergedToolbar)
              .clearButtons()
              .buttons(mergedButtons);
      return header == null ? merged.build() : withHeader(merged, page, header).build();
    }
    var wrapper =
        io.mateu.uidl.fluent.PageView.builder()
            .toolbar(toolbar)
            .buttons(buttons)
            .content(java.util.List.of(tree));
    if (!SelfNamingTree.namesItself(tree)) {
      wrapper.title(ReflectionPageMapper.getTitle(owner, httpRequest));
    }
    if (header != null) {
      wrapper =
          wrapper
              .subtitle(header.subtitle())
              .overline(header.overline())
              .timestamp(header.timestamp())
              .peerNav(header.peerNav())
              .switcher(header.switcher())
              .avatar(header.avatar())
              .badges(header.badges())
              .kpis(header.kpis())
              .banners(header.banners());
    }
    return wrapper.build();
  }

  /** What the tree's own page leaves unset is taken from the view's declared header. */
  private static io.mateu.uidl.fluent.PageView.PageViewBuilder withHeader(
      io.mateu.uidl.fluent.PageView.PageViewBuilder builder,
      io.mateu.uidl.fluent.PageView page,
      io.mateu.uidl.fluent.PageView header) {
    if (page.subtitle() == null) builder.subtitle(header.subtitle());
    if (page.overline() == null) builder.overline(header.overline());
    if (page.timestamp() == null) builder.timestamp(header.timestamp());
    if (page.peerNav() == null) builder.peerNav(header.peerNav());
    if (page.switcher() == null) builder.switcher(header.switcher());
    if (page.avatar() == null) builder.avatar(header.avatar());
    if (page.badges() == null || page.badges().isEmpty()) builder.badges(header.badges());
    if (page.kpis() == null || page.kpis().isEmpty()) builder.kpis(header.kpis());
    if (page.banners() == null || page.banners().isEmpty()) builder.banners(header.banners());
    return builder;
  }
}
