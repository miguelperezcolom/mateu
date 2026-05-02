package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.application.runaction.RunActionUseCase.getState;
import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getView;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.*;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.mapValidations;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.UUID;

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
    Object viewModel = view instanceof AutoNamedView autoNamedView ? autoNamedView.entity() : view;

    return new ServerSideComponentDto(
        UUID.randomUUID().toString(),
        this.getClass().getName(),
        List.of(
            (ServerSideComponentDto)
                wrap(
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
                        .toolbar(
                            List.of(
                                new Button("Cancel", "cancel-create"),
                                new Button("Create", "create")))
                        .build(),
                    viewModel,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest)),
        getState(this, httpRequest),
        "",
        "",
        mapActions(this),
        mapTriggers(this, httpRequest),
        mapRules(this),
        mapValidations(this, httpRequest.runActionRq().route()),
        null,
        null);
  }
}
