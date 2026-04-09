package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.Deleteable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public abstract class ListComponentLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends CreateComponentLayer<View, Editor, CreationForm, Filters, Row, IdType> {

  public Component list(HttpRequest httpRequest) {
    setStateTo("list");
    var toolbar = new ArrayList<UserTrigger>();
    addButtons(toolbar);
    if (!readOnly()) {
      toolbar.add(new Button("New", "new"));
      if (Deleteable.class.isAssignableFrom(viewClass())) {
        toolbar.add(
            Button.builder()
                .label("Delete")
                .actionId("delete")
                .variant(ButtonVariant.error)
                .build());
      }
    }
    List<GridContent> columns =
        getClass().isAnnotationPresent(ReadOnly.class)
            ? (List<GridContent>)
                getColumns(
                    rowClass(),
                    this,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest)
            : Stream.concat(
                    getColumns(
                        rowClass(),
                        this,
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest)
                        .stream(),
                    Stream.of(
                        GridColumn.builder()
                            .label("Action")
                            .id("_action")
                            .stereotype(FieldStereotype.button)
                            .actionId("view")
                            .text("View")
                            .build()))
                .toList();
    String title;
    httpRequest.setAttribute("windowTitle", title = title());
    return Page.builder()
        .title(title)
        .style(getStyleForList(columns))
        .content(
            List.of(
                Listing.builder()
                    .listingType(ListingType.table)
                    .title("Xxx")
                    .searchable(searchable())
                    .rowsSelectionEnabled(selectionEnabled())
                    .columns(columns)
                    .filters(
                        getFilters(
                            filtersClass(),
                            this,
                            "base_url",
                            httpRequest.runActionRq().route(),
                            httpRequest.runActionRq().consumedRoute(),
                            httpRequest.runActionRq().initiatorComponentId(),
                            httpRequest))
                    .style("min-width: 30rem; display: block;")
                    .build()))
        .toolbar(toolbar)
        .build();
  }

  public String getStyleForList(List<GridContent> columns) {
    if (getClass().isAnnotationPresent(Style.class)) {
      return getClass().getAnnotation(Style.class).value();
    }
    return columns.size() > 5 ? "width: 100%;" : StyleConstants.CONTAINER;
  }
}
