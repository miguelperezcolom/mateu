package io.mateu.uidl.interfaces;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
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

  /**
   * Whether the listing runs its search as soon as it opens, so it shows its rows without the user
   * having to search first. True by default: a listing is for looking at rows. A search-first page
   * — one that should open empty and wait for the query — answers false (the {@code
   * SmartSearchPage} and {@code HeroSearch} archetypes do).
   */
  default boolean searchesOnOpening() {
    return true;
  }

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
      // the «Add selected» toolbar button of a multi-valued @Searchable field's selector
      actions.add(
          Action.builder()
              .id("action-on-row-" + SearchableSelection.ADD_SELECTED_ACTION)
              .rowsSelectedRequired(true)
              .build());
    }
    return actions;
  }

  @Override
  default Object handleAction(String actionId, HttpRequest httpRequest) {
    if (actionId.startsWith("action-on-row-")) {
      String methodName = actionId.substring("action-on-row-".length());
      return handleActionOnRow(methodName, httpRequest);
    }
    var request = SearchRequestBuilder.build(this, httpRequest);
    var found = search(request, httpRequest);
    var data = found != null ? found : new ListingData<Row>(new Page<>("", 0, 0, 0, List.of()));
    // ?ids=… works on every listing: a search that did not narrow to them itself is narrowed here
    data = IdSetFilter.narrow(data, request.ids());
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
      // a multi-valued field ADDS the clicked row to the ids it holds (SearchableSelection)
      return SearchableSelection.commands(
          selector,
          java.util.Collections.singletonList(selector.selected(httpRequest)),
          httpRequest);
    }
    if (SearchableSelection.ADD_SELECTED_ACTION.equals(methodName)
        && this instanceof Selector<?> selector) {
      // «Add selected» of a multi-valued field: every checked row
      return SearchableSelection.commands(
          selector, selector.selectedItems(httpRequest), httpRequest);
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
   * The layout this listing renders in. Undeclared ({@link GridLayout#auto}) is a plain {@code
   * table} — override to ask for {@code cards}, {@code list}, {@code masterDetail} or {@code tree}.
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
