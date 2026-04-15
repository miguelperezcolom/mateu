package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;
import static io.mateu.core.infra.declarative.FormViewModel.createKpis;
import static io.mateu.core.infra.declarative.crudorchestrator.DataLayer.addData;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ModelSupplier;
import java.util.ArrayList;
import java.util.List;

public abstract class ViewComponentLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends StateSupplierLayer<View, Editor, CreationForm, Filters, Row, IdType> {

  @Override
  public Object view(IdType id, HttpRequest httpRequest) {
    var view = adapter().getView(id, httpRequest);
    //    if (found.isEmpty()) {
    //      throw new RuntimeException("No item found with id " + id);
    //    }
    //    var item = found.get();
    httpRequest.setAttribute("selectedItem", view);
    setStateTo("view");
    return wrap(
        viewComponent(view, httpRequest),
        this,
        "base_url",
        httpRequest.runActionRq().route(),
        httpRequest.runActionRq().consumedRoute(),
        httpRequest.runActionRq().initiatorComponentId(),
        addData(view, httpRequest));
  }

  protected Component viewComponent(Object item, HttpRequest httpRequest) {
    var toolbar = createViewToolbar(item);
    String title;
    httpRequest.setAttribute("windowTitle", title = getTitle(item));
    return Page.builder()
        .title(title)
        .style(getStyleForView())
        .badges(createBadges(item))
        .kpis(createKpis(item))
        .content(
            getView(
                    item,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest,
                    true,
                    false)
                .stream()
                .toList())
        .toolbar(toolbar)
        .build();
  }

  public String getStyleForView() {
    if (viewClass().isAnnotationPresent(Style.class)) {
      return viewClass().getAnnotation(Style.class).value();
    }
    return getFormColumns(viewClass()) > 2 ? "width: 100%;" : "max-width:900px;margin: auto;";
  }

  private List<UserTrigger> createViewToolbar(Object item) {
    var toolbar = new ArrayList<UserTrigger>();
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ViewToolbarButton.class))
        .forEach(
            method -> {
              toolbar.add(
                  new Button(
                      toUpperCaseFirst(method.getName()), "action-on-view-" + method.getName()));
            });
    toolbar.add(new Button("Back to list", "cancel-view"));
    if (!readOnly(item)) {
      toolbar.add(new Button("Add another", "new"));
      toolbar.add(new Button("Edit", "edit"));
    }
    return toolbar;
  }

  private boolean readOnly(Object item) {
    if (readOnly()) {
      return true;
    }
    if (viewClass().isAnnotationPresent(ReadOnly.class)) {
      return true;
    }
    if (item instanceof ModelSupplier modelSupplier) {
      return modelSupplier.model().getClass().isAnnotationPresent(ReadOnly.class);
    }
    return false;
  }

  public void addButtons(ArrayList<UserTrigger> toolbar) {
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
        .forEach(
            method -> {
              toolbar.add(
                  Button.builder()
                      .label(toUpperCaseFirst(method.getName()))
                      .actionId("action-on-row-" + method.getName())
                      .build());
            });
  }
}
