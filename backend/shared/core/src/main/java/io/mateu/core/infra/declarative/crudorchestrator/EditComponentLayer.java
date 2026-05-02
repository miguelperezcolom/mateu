package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.application.runaction.RunActionUseCase.getState;
import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getView;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.*;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.mapValidations;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;
import static io.mateu.core.infra.declarative.crudorchestrator.DataLayer.addData;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.UUID;

public abstract class EditComponentLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends ViewComponentLayer<View, Editor, CreationForm, Filters, Row, IdType> {

  @Override
  public Object edit(IdType id, HttpRequest httpRequest) {
    var editor = adapter().getEditor(id, httpRequest);
    //    var found = adapter().findById(id);
    //    if (found.isEmpty()) {
    //      throw new RuntimeException("No item found with id " + id);
    //    }
    //    var item = found.get();
    httpRequest.setAttribute("selectedItem", editor);
    setStateTo("edit");
    String title;
    httpRequest.setAttribute("windowTitle", title = getTitle(editor));
    Object viewModel =
        editor instanceof AutoNamedView autoNamedView ? autoNamedView.entity() : editor;

    return new ServerSideComponentDto(
        UUID.randomUUID().toString(),
        this.getClass().getName(),
        List.of(
            (ServerSideComponentDto)
                wrap(
                    Page.builder()
                        .title(title)
                        .style(getStyleForView())
                        .badges(createBadges(editor))
                        .content(
                            getView(
                                    editor,
                                    "base_url",
                                    httpRequest.runActionRq().route(),
                                    httpRequest.runActionRq().consumedRoute(),
                                    httpRequest.runActionRq().initiatorComponentId(),
                                    httpRequest,
                                    false,
                                    false)
                                .stream()
                                .toList())
                        .toolbar(
                            List.of(
                                new Button("Cancel", "cancel-edit"), new Button("Save", "save")))
                        .build(),
                    viewModel,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    addData(viewModel, httpRequest))),
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
