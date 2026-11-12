package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getView;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getPageSubtitle;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;
import static io.mateu.core.infra.declarative.FormViewModel.createKpis;

import io.mateu.core.infra.declarative.orchestrators.DetailContent;
import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class ViewRouteResolver implements CrudOrchestratorRouteResolver {
  @Override
  public boolean supports(String route, HttpRequest httpRequest, MultiView orchestrator) {
    return true;
  }

  @Override
  public OrchestrationResult resolve(String route, HttpRequest httpRequest, Crud orchestrator) {
    // A crud that offers no record page (@NotNavigable, or a capability listing that is not
    // Navigable) must not serve one to a typed / bookmarked URL either: hiding the row link is UX,
    // this is the rule. The route answers the standard not-found page.
    if (io.mateu.core.infra.reflection.MetaAnnotations.isPresent(
            orchestrator.metadataSource(), io.mateu.uidl.annotations.NotNavigable.class)
        || !orchestrator.canView()) {
      throw new java.util.NoSuchElementException();
    }
    // This is the catch-all resolver (supports() == true), so guard the id extraction: only strip
    // the consumedRoute prefix when the route actually lives under it (route = consumedRoute/{id});
    // otherwise take the last path segment. Prevents a StringIndexOutOfBoundsException when a route
    // that is not a sub-route of consumedRoute falls through here.
    var consumedRoute = orchestrator.getConsumedRoute(httpRequest);
    var id =
        route.startsWith(consumedRoute + "/")
            ? route.substring(consumedRoute.length() + 1)
            : route.substring(route.lastIndexOf('/') + 1);
    var view = orchestrator.view(orchestrator.toId(id), httpRequest);
    if (view instanceof java.net.URI || view instanceof java.net.URL) {
      // the record opens somewhere else (an editable page of routes.yaml, another app): the row
      // navigates there, as an action returning a URI does (issue #1167 — it was read as a form
      // and failed in FormViewSerializer)
      return new OrchestrationResult("view", view, view);
    }
    httpRequest.setAttribute("selectedItem", view);
    return new OrchestrationResult(
        "view", view, createViewComponent(httpRequest, view, orchestrator));
  }

  /**
   * The record's page: the crud's header and toolbar around the record's own content ({@code
   * DetailContentSupplier}) or its read-only form. Also what a button of the page answers with when
   * it re-renders the record in place ({@code ActionOnViewActionHandler}).
   */
  public static Component createViewComponent(
      HttpRequest httpRequest, Object view, Crud orchestrator) {
    Object viewModel = view;
    // the record's own @Toolbar buttons bubble to the crud: the page advertises them so
    // (RecordToolbarActions)
    httpRequest.setAttribute(RecordToolbarActions.RECORD_PAGE, viewModel);
    var toolbar = createViewToolbar(viewModel, orchestrator, httpRequest);
    String title;
    httpRequest.setAttribute("windowTitle", title = getTitle(viewModel, httpRequest));
    var page =
        PageView.builder()
            .title(title)
            // the record's own subtitle (SubtitleSupplier / @Subtitle): e.g. a booking's amounts
            .subtitle(getPageSubtitle(viewModel))
            .style(orchestrator.getStyleForView())
            .badges(createBadges(viewModel))
            .kpis(createKpis(viewModel))
            // the record's own content (DetailContentSupplier), else its read-only form; the
            // header and the toolbar above stay the crud's either way
            .content(
                DetailContent.of(
                    viewModel,
                    httpRequest,
                    () ->
                        getView(
                                viewModel,
                                "base_url",
                                httpRequest.runActionRq().route(),
                                httpRequest.runActionRq().consumedRoute(),
                                httpRequest.runActionRq().initiatorComponentId(),
                                httpRequest,
                                true,
                                false)
                            .stream()
                            .map(Component.class::cast)
                            .toList()))
            .toolbar(toolbar)
            .build();
    return page;
  }

  private static List<UserTrigger> createViewToolbar(
      Object item, Crud orchestrator, HttpRequest httpRequest) {
    return ViewToolbarBuilder.createViewToolbar(item, orchestrator, httpRequest);
  }
}
