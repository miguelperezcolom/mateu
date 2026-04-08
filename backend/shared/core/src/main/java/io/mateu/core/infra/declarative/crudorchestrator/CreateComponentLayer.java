package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getView;

import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public abstract class CreateComponentLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends EditComponentLayer<View, Editor, CreationForm, Filters, Row, IdType> {

  @Override
  public Object create(HttpRequest httpRequest) {
    httpRequest.setAttribute("new", true);
    setStateTo("create");
    var view = adapter().getCreationForm(httpRequest);
    httpRequest.setAttribute("selectedItem", view);
      String title;
      httpRequest.setAttribute("windowTitle", title = getTitle(view));
    return wrap(
        Page.builder()
            .title(title)
            .style(getStyleForView())
            .content(
                getView(
                        view,
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().consumedRoute(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest,
                        false,
                        true)
                    .stream()
                    .toList())
            .toolbar(List.of(new Button("Cancel", "cancel-create"), new Button("Create", "create")))
            .build(),
        this,
        "base_url",
        httpRequest.runActionRq().route(),
        httpRequest.runActionRq().consumedRoute(),
        httpRequest.runActionRq().initiatorComponentId(),
        httpRequest);
  }
}
