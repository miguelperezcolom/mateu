package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getView;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.*;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public abstract class EditComponentLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends ViewComponentLayer<View, Editor, CreationForm, Filters, Row, IdType> {

  @Override
  public Component edit(IdType id, HttpRequest httpRequest) {
    var editor = adapter().getEditor(id, httpRequest);
    //    var found = adapter().findById(id);
    //    if (found.isEmpty()) {
    //      throw new RuntimeException("No item found with id " + id);
    //    }
    //    var item = found.get();
    httpRequest.setAttribute("selectedItem", editor);
    setRouteTo("edit");
    String title;
    httpRequest.setAttribute("windowTitle", title = getTitle(editor));
    Object viewModel =
        editor instanceof AutoNamedView autoNamedView ? autoNamedView.entity() : editor;

    return Page.builder()
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
        .toolbar(List.of(new Button("Cancel", "cancel-edit"), new Button("Save", "save")))
        .actions(List.of(Action.builder().id("save").validationRequired(true).bubble(true).build()))
        .build();
  }
}
