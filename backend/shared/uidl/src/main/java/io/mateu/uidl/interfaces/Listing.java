package io.mateu.uidl.interfaces;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.CustomEvent;
import io.mateu.uidl.fluent.GridLayout;
import java.util.List;
import java.util.Map;

/**
 * A listing: rows shown as a searchable, sortable, paginated grid. Implement {@link
 * #search(SearchRequest, HttpRequest)} to return a {@link ListingData} page of {@code Row} objects
 * — that alone gives you the listing with column sorting and pagination.
 *
 * <p>Every further feature is an optional capability, activated by declaring it on the same class:
 *
 * <ul>
 *   <li>{@link Searchable} — free-text search box ({@code request.searchText()})
 *   <li>{@link Filterable Filterable&lt;F&gt;} — filter bar built from {@code F} ({@code
 *       filters(request)})
 *   <li>{@code Navigable<Detail,Id>} — rows open a read-only detail
 *   <li>{@code Editable<Editor,Id>} — records can be edited
 *   <li>{@code Creatable<Form,Id>} — records can be created
 *   <li>{@code Deletable<Id>} — rows can be selected and deleted
 * </ul>
 *
 * <p>{@code Crud} is simply a listing with all the capabilities declared; {@code AutoCrud<T>}
 * derives everything from the entity and its {@code CrudStore}.
 *
 * @param <Row> the type of each row in the listing
 */
public interface Listing<Row> extends ActionHandler, ActionSupplier {

  ListingData<Row> search(SearchRequest request, HttpRequest httpRequest);

  @Override
  default boolean supportsAction(String actionId) {
    return "search".equals(actionId);
  }

  @Override
  default List<String> supportedActions() {
    return List.of("search", "action-on-row-*", "action-on-view-*");
  }

  @Override
  default List<Action> actions(HttpRequest httpRequest) {
    var actions = new java.util.ArrayList<Action>();
    actions.add(Action.builder().id("search").build());
    // a listing whose backend answers "view" is navigable: the action must be ADVERTISED or
    // the shared renderer drops the row click (unclaimed action-requested events are ignored)
    if (supportsAction("view")) {
      actions.add(Action.builder().id("view").build());
    }
    // @ListToolbarButton / @Toolbar methods dispatch their bare method name from the toolbar —
    // advertise them too, or the shared renderer drops the click the same way. An @Action on the
    // same method declares how the button BEHAVES (confirmation texts, timeout, sse…), exactly as
    // it does on a detail-view method: see ToolbarButtons.
    for (var method : getClass().getMethods()) {
      var toolbarButton = method.getAnnotation(io.mateu.uidl.annotations.ListToolbarButton.class);
      var behaviour = method.getAnnotation(io.mateu.uidl.annotations.Action.class);
      if (toolbarButton != null) {
        actions.add(
            io.mateu.uidl.fluent.ToolbarButtons.toolbarAction(
                method.getName(),
                behaviour,
                toolbarButton.confirmationRequired(),
                toolbarButton.rowsSelectedRequired()));
      } else if (method.getAnnotation(io.mateu.uidl.annotations.Toolbar.class) != null) {
        actions.add(
            io.mateu.uidl.fluent.ToolbarButtons.toolbarAction(
                method.getName(), behaviour, false, false));
      }
    }
    if (this instanceof Selector<?>) {
      actions.add(Action.builder().id("action-on-row-select").build());
    }
    return actions;
  }

  @Override
  default Object handleAction(String actionId, HttpRequest httpRequest) {
    if (actionId.startsWith("action-on-row-")) {
      String methodName = actionId.substring("action-on-row-".length());
      return handleActionOnRow(methodName, httpRequest);
    }
    var found = search(SearchRequestBuilder.build(this, httpRequest), httpRequest);
    var data = found != null ? found : new ListingData<Row>(new Page<>("", 0, 0, 0, List.of()));
    // @GroupBy rows on a custom listing: synthesize the group summaries the grid needs when the
    // implementation didn't compute them itself, then hide the @GroupAction buttons the listing
    // declares not applicable per group.
    data = GroupActions.applyVisibility(this, data.withSynthesizedGroups(rowClass()), httpRequest);
    return new Data(Map.of(getCrudId(httpRequest), data));
  }

  /**
   * Row action hook. The default handles the {@code select} action of lookup {@link Selector}s
   * (emits the value/label/close events the lookup field listens for); any other method name is
   * invoked reflectively by the engine. Override to intercept row actions yourself.
   */
  default Object handleActionOnRow(String methodName, HttpRequest httpRequest) {
    if ("select".equals(methodName) && this instanceof Selector<?> selector) {
      var selectedItem = selector.selected(httpRequest);
      return List.of(
          UICommand.builder()
              .type(UICommandType.DispatchEvent)
              .data(
                  CustomEvent.builder()
                      .eventName("value-changed")
                      .detail(
                          Map.of(
                              "fieldId", selector.fieldId(),
                              "value", selectedItem.id()))
                      .build())
              .build(),
          UICommand.builder()
              .type(UICommandType.DispatchEvent)
              .data(
                  CustomEvent.builder()
                      .eventName("data-changed")
                      .detail(
                          Map.of(
                              "key", selector.fieldId() + "-label", "value", selectedItem.label()))
                      .build())
              .build(),
          UICommand.builder()
              .type(UICommandType.DispatchEvent)
              .data(CustomEvent.builder().eventName("close-modal-requested").build())
              .build());
    }
    return null;
  }

  default String getCrudId(HttpRequest httpRequest) {
    if (httpRequest.runActionRq().parameters() != null
        && httpRequest.runActionRq().parameters().get("crudId") != null) {
      return (String) httpRequest.runActionRq().parameters().get("crudId");
    }
    return "crud";
  }

  default Class<Row> rowClass() {
    return getGenericClass(this.getClass(), Listing.class, "Row");
  }

  default boolean selectionEnabled() {
    return false;
  }

  /**
   * Preferred grid layout for this listing. Defaults to {@link GridLayout#auto} (the renderer picks
   * via the weight formula). Override to force a concrete layout, e.g. {@code table} for an
   * information-dense listing whose many columns would otherwise fall back to {@code masterDetail}.
   */
  default GridLayout gridLayout() {
    return GridLayout.auto;
  }

  default boolean pdfExportable() {
    return false;
  }

  default boolean excelExportable() {
    return false;
  }

  default boolean csvExportable() {
    return false;
  }
}
