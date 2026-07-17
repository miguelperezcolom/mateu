package io.mateu.uidl.interfaces;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.GridLayout;
import java.util.List;
import java.util.Map;

/**
 * Backend contract for a searchable, paginated, sortable listing (the data source behind a Mateu
 * grid/CRUD listing). Implement {@link #search(String, Object, Pageable, HttpRequest)} to return a
 * {@link ListingData} page of {@code Row} objects for the given free-text {@code searchText},
 * strongly-typed {@code Filters}, and {@link Pageable} (page/size/sort). The default {@link
 * #handleAction} wires the {@code "search"} action (and {@code action-on-row-*} row actions) to
 * your {@code search}, so implementers normally only provide {@code search}; override {@link
 * #selectionEnabled()} to allow row selection and {@link #gridLayout()} to force a grid layout.
 *
 * @param <Filters> the type carrying the listing's filter fields
 * @param <Row> the type of each row in the listing
 */
public interface ListingBackend<Filters, Row> extends ActionHandler, ActionSupplier {

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
    return List.of(Action.builder().id("search").build());
  }

  @Override
  default Object handleAction(String actionId, HttpRequest httpRequest) {
    if (actionId.startsWith("action-on-row-")) {
      String methodName = actionId.substring("action-on-row-".length());
      return handleActionOnRow(methodName, httpRequest);
    }
    var searchText = httpRequest.getString("searchText");
    Filters filters =
        MateuInstanceFactory.newInstance(
            filtersClass(),
            FilterStateAssembler.assemble(
                filtersClass(), httpRequest.runActionRq().componentState()),
            httpRequest);

    var found =
        search(
            searchText != null ? searchText : "",
            filters,
            new Pageable(
                httpRequest.getInt("page"),
                httpRequest.getInt("size"),
                httpRequest.getListOfMaps("sort").stream()
                    .filter(map -> map.containsKey("direction"))
                    .map(
                        map ->
                            new Sort(
                                (String) map.get("fieldId"),
                                Direction.valueOf((String) map.get("direction"))))
                    .toList()),
            httpRequest);
    var data = found != null ? found : new ListingData<Row>(new Page<>("", 0, 0, 0, List.of()));
    // @GroupBy rows on a custom listing: synthesize the group summaries the grid needs when the
    // implementation didn't compute them itself, then hide the @GroupAction buttons the listing
    // declares not applicable per group.
    data = GroupActions.applyVisibility(this, data.withSynthesizedGroups(rowClass()), httpRequest);
    return new Data(Map.of(getCrudId(httpRequest), data));
  }

  default Object handleActionOnRow(String methodName, HttpRequest httpRequest) {
    return null;
  }

  default String getCrudId(HttpRequest httpRequest) {
    if (httpRequest.runActionRq().parameters() != null
        && httpRequest.runActionRq().parameters().get("crudId") != null) {
      return (String) httpRequest.runActionRq().parameters().get("crudId");
    }
    return "crud";
  }

  default Class<Filters> filtersClass() {
    return getGenericClass(this.getClass(), ListingBackend.class, "Filters");
  }

  default Class<Row> rowClass() {
    return getGenericClass(this.getClass(), ListingBackend.class, "Row");
  }

  ListingData<Row> search(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest);

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
}
