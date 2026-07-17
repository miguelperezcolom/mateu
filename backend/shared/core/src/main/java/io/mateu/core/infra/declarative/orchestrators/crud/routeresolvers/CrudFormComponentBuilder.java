package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getView;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.SplitCrud;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

public class CrudFormComponentBuilder {

  public static Component build(
      boolean isCreation, HttpRequest httpRequest, Object editor, Crud orchestrator) {
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
                    isCreation)
                .stream()
                .toList())
        .toolbar(buildToolbar(isCreation, orchestrator))
        .actions(
            List.of(
                Action.builder()
                    .id(isCreation ? "create" : "save")
                    .validationRequired(true)
                    .bubble(true)
                    .build()))
        .build();
  }

  private static List<UserTrigger> buildToolbar(boolean isCreation, Crud orchestrator) {
    List<UserTrigger> buttons = new ArrayList<>();
    if (!isCreation || !MetaAnnotations.isPresent(orchestrator.getClass(), SplitCrud.class)) {
      buttons.add(
          new Button(orchestrator.cancelLabel(), isCreation ? "cancel-new" : "cancel-edit"));
    }
    // The edit form persists through "save" (Crud.save → the editor's state); "create" would
    // route to saveNew with the CREATION form's (empty) state, silently discarding the edit.
    buttons.add(new Button(orchestrator.saveLabel(), isCreation ? "create" : "save"));
    return buttons;
  }
}
