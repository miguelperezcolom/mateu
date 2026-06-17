package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getView;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.annotations.SplitCrud;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

public class NewRouteResolver implements CrudOrchestratorRouteResolver {
  @Override
  public boolean supports(String route, HttpRequest httpRequest, MultiView orchestrator) {
    return route.endsWith("/new");
  }

  @Override
  public OrchestrationResult resolve(
      String route, HttpRequest httpRequest, Crud orchestrator) {
    var editor = orchestrator.adapter().getCreationForm(httpRequest);
    httpRequest.setAttribute("selectedItem", editor);
    return new OrchestrationResult(
        "new", editor, createEditorComponent(httpRequest, editor, orchestrator));
  }

  public static Component createEditorComponent(
      HttpRequest httpRequest, Object editor, Crud orchestrator) {
    Object viewModel =
        editor instanceof AutoNamedView autoNamedView ? autoNamedView.entity() : editor;
    String title;
    httpRequest.setAttribute("windowTitle", title = getTitle(viewModel));
    return PageView.builder()
        .title(title)
        .style(orchestrator.getStyleForView())
        .badges(createBadges(viewModel))
        .content(
            getView(
                    editor,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest,
                    false,
                    true)
                .stream()
                .toList())
        .toolbar(createToolbar(orchestrator))
        .actions(
            List.of(Action.builder().id("create").validationRequired(true).bubble(true).build()))
        .build();
  }

  private static List<UserTrigger> createToolbar(Crud orchestrator) {
    List<UserTrigger> buttons = new ArrayList<>();
    if (!orchestrator.getClass().isAnnotationPresent(SplitCrud.class)) {
      buttons.add(new Button("Cancel", "cancel-new"));
    }
    buttons.add(new Button("Save", "create"));
    return buttons;
  }
}
