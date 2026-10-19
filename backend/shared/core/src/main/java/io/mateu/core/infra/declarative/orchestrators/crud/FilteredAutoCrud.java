package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.getIdField;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.*;
import java.util.List;
import java.util.Map;

public abstract class FilteredAutoCrud<Filters, T extends Identifiable>
    extends Crud<T, T, T, Filters, T, String> {

  @Override
  public T view(String id, HttpRequest httpRequest) {
    return buildNamedView(id, httpRequest);
  }

  @Override
  public T edit(String id, HttpRequest httpRequest) {
    return buildNamedView(id, httpRequest);
  }

  @Override
  public T creationForm(HttpRequest httpRequest) {
    return buildCreationForm(httpRequest);
  }

  @Override
  public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
    store().deleteAllById(selectedIds);
  }

  @SuppressWarnings("unchecked")
  public ListingData<T> fetchRows(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
    // For AutoCrud, Filters == T (filtersClass() == entityClass()) and the instance is forwarded so
    // custom repositories can apply field-level filtering. Subclasses with their own filters type
    // must override fetchRows to apply them — forwarding an incompatible type would CCE in find().
    T rowFilters = entityClass().isInstance(filters) ? (T) filters : null;
    var spec = ListingSummarySpec.of(rowClass());
    var data =
        new ListingData<>(store().find(searchText, rowFilters, spec.prependGroupSort(pageable)));
    return withSummaries(data, spec, searchText, rowFilters, List.of());
  }

  /**
   * Like {@link #fetchRows(String, Object, Pageable, HttpRequest)} plus the range/multi-select
   * criteria. Without criteria it delegates to the 3-arg repository {@code find} so repositories
   * that only override that one keep their behaviour for plain searches.
   */
  @SuppressWarnings("unchecked")
  public ListingData<T> fetchRows(
      String searchText,
      Filters filters,
      List<io.mateu.uidl.data.FilterCriterion> criteria,
      Pageable pageable,
      HttpRequest httpRequest) {
    if (criteria == null || criteria.isEmpty()) {
      return fetchRows(searchText, filters, pageable, httpRequest);
    }
    T rowFilters = entityClass().isInstance(filters) ? (T) filters : null;
    var spec = ListingSummarySpec.of(rowClass());
    var data =
        new ListingData<>(
            store().find(searchText, rowFilters, criteria, spec.prependGroupSort(pageable)));
    return withSummaries(data, spec, searchText, rowFilters, criteria);
  }

  /**
   * Attaches the {@code @Aggregate} totals and {@code @GroupBy} group subtotals to the page —
   * computed by {@link CrudStore#summaries} over the WHOLE filtered set (in memory by default;
   * repositories backed by a database override it with one aggregate query).
   */
  private ListingData<T> withSummaries(
      ListingData<T> data,
      ListingSummarySpec spec,
      String searchText,
      T rowFilters,
      List<io.mateu.uidl.data.FilterCriterion> criteria) {
    if (spec.isEmpty()) {
      return data;
    }
    var summaries =
        store().summaries(searchText, rowFilters, criteria, spec.aggregates(), spec.groupBy());
    return data.withAggregates(summaries.totals()).withGroups(summaries.groups());
  }

  /** The entity shown in the read-only view and the edit form. Override to customise the load. */
  public T buildNamedView(String id, HttpRequest httpRequest) {
    return store().findById(id).orElseThrow();
  }

  /** The entity backing the creation form. Override to return a pre-populated instance. */
  @SuppressWarnings("unchecked")
  public T buildCreationForm(HttpRequest httpRequest) {
    Map<String, Object> data = Map.of();
    if (!"create".equals(httpRequest.runActionRq().actionId())) {
      // a crud inside a record master's tab (/customers/7/orders/new): the new child already
      // belongs to the master — its field named like the route's :customerId starts filled in
      data =
          io.mateu.core.application.runaction.RouteChains.scopeValuesFor(
              entityClass(), httpRequest);
    }
    if ("create".equals(httpRequest.runActionRq().actionId())) {
      if (httpRequest.runActionRq().parameters() != null
          && httpRequest.runActionRq().parameters().containsKey("initiatorState")) {
        data = (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
      }
    }
    return (T)
        MateuBeanProvider.getSingletonBean(InstanceFactory.class)
            .newInstance(entityClass(), data, httpRequest);
  }

  @SuppressWarnings("unchecked")
  T toEntity(HttpRequest httpRequest) {
    // parameters is nullable on the wire — without the guard a save with no parameters NPEd
    // before ever reaching the componentState fallback below.
    var parameters = httpRequest.runActionRq().parameters();
    var initiatorState =
        parameters != null ? (Map<String, Object>) parameters.get("initiatorState") : null;
    if (initiatorState != null) {
      return (T) MateuInstanceFactory.newInstance(entityClass(), initiatorState, httpRequest);
    }
    return httpRequest.getComponentState(entityClass());
  }

  /** The state the save was posted with: the bubbled form's ({@code initiatorState}), else own. */
  @SuppressWarnings("unchecked")
  private Map<String, Object> postedState(HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    var initiatorState =
        parameters != null ? (Map<String, Object>) parameters.get("initiatorState") : null;
    return initiatorState != null ? initiatorState : httpRequest.runActionRq().componentState();
  }

  /**
   * The entity an edit saves: the posted state, except for what the edit form did not let the user
   * change — its read-only and hidden fields and the record's id — which keep the values of the
   * record the route names (see {@link ClientWritableFields}).
   */
  @SuppressWarnings("unchecked")
  T toEditedEntity(HttpRequest httpRequest) {
    var posted = postedState(httpRequest);
    var routeId =
        io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.CrudIdExtractor
            .idFromRoute(this, httpRequest);
    var postedId = posted != null ? posted.get(getIdFieldForRow()) : null;
    var loaded = routeId != null ? recordAt(routeId) : null;
    if (loaded == null && routeId == null && postedId != null) {
      loaded = store().findById(String.valueOf(postedId)).orElse(null); // a drawer: no record url
    }
    if (loaded == null) {
      return toEntity(httpRequest); // nothing loaded to compare with: a new record by its id
    }
    var restricted =
        ClientWritableFields.restrict(
            entityClass(),
            posted,
            loaded,
            io.mateu.core.infra.declarative.FormViewModel.toMap(loaded),
            getIdFieldForRow(),
            false,
            httpRequest);
    return (T) MateuInstanceFactory.newInstance(entityClass(), restricted, httpRequest);
  }

  /**
   * The record a route tail names: the tail itself (an id may carry slashes), else what is left of
   * it once leading segments are dropped — the mount the browser left on the route.
   */
  private T recordAt(String tail) {
    var candidate = tail;
    while (candidate != null && !candidate.isEmpty()) {
      var found = store().findById(candidate);
      if (found.isPresent()) {
        return found.get();
      }
      int slash = candidate.indexOf('/');
      candidate = slash >= 0 ? candidate.substring(slash + 1) : null;
    }
    return null;
  }

  /**
   * The entity a create saves: the posted state, except for the fields the creation form showed
   * read-only or did not show, which keep the values of a fresh creation form.
   */
  @SuppressWarnings("unchecked")
  T toCreatedEntity(HttpRequest httpRequest) {
    var fresh =
        MateuBeanProvider.getBean(InstanceFactory.class)
            .newInstance(
                entityClass(),
                io.mateu.core.application.runaction.RouteChains.scopeValuesFor(
                    entityClass(), httpRequest),
                httpRequest);
    var restricted =
        ClientWritableFields.restrict(
            entityClass(),
            postedState(httpRequest),
            fresh,
            io.mateu.core.infra.declarative.FormViewModel.toMap(fresh),
            getIdFieldForRow(),
            true,
            httpRequest);
    return (T) MateuInstanceFactory.newInstance(entityClass(), restricted, httpRequest);
  }

  @Override
  public Class<T> entityClass() {
    return getGenericClass(getClass(), FilteredAutoCrud.class, "T");
  }

  public Class filtersClass() {
    return entityClass();
  }

  public Class rowClass() {
    return entityClass();
  }

  public Class viewClass() {
    return entityClass();
  }

  @Override
  public Class editorClass() {
    return entityClass();
  }

  @Override
  public Class creationFormClass() {
    return entityClass();
  }

  @Override
  public String save(HttpRequest httpRequest) {
    var entity = toEditedEntity(httpRequest);
    // the browser checked the entity's constraints; the server does not take its word for it
    io.mateu.core.domain.out.fragmentmapper.mappers.ServerConstraintCheck.enforce(
        entity, httpRequest, false);
    // optimistic locking (@Version field): reject the save when someone else saved in between,
    // bump the version otherwise — both no-ops for entities without a version field
    OptimisticLock.check(entity, store().findById(entity.id()), httpRequest);
    OptimisticLock.bump(entity);
    store().save(entity);
    return entity.id();
  }

  @Override
  @SuppressWarnings("unchecked")
  public Object updateRow(Map<String, Object> row, HttpRequest httpRequest) {
    // the same protection as save (NM11): the row names a STORED record — an unknown id is refused,
    // never inserted —, the fields the user may not write keep the stored values, and the row (its
    // columns only) is laid over the stored record, so the fields it does not carry are kept
    var id = row == null ? null : row.get(getIdFieldForRow());
    var loaded = id == null ? null : store().findById(String.valueOf(id)).orElse(null);
    if (loaded == null) {
      throw new io.mateu.uidl.UserFacingException(
          "This row no longer exists. Reload the list to see the current rows.");
    }
    var stored = io.mateu.core.infra.declarative.FormViewModel.toMap(loaded);
    var restricted =
        ClientWritableFields.restrict(
            entityClass(), row, loaded, stored, getIdFieldForRow(), false, httpRequest);
    var merged = new java.util.LinkedHashMap<String, Object>(stored);
    merged.putAll(restricted);
    var entity = (T) MateuInstanceFactory.newInstance(entityClass(), merged, httpRequest);
    io.mateu.core.domain.out.fragmentmapper.mappers.ServerConstraintCheck.enforce(
        entity, httpRequest, false);
    OptimisticLock.check(entity, java.util.Optional.of(loaded), httpRequest);
    OptimisticLock.bump(entity);
    store().save(entity);
    return io.mateu.uidl.data.Message.success("Saved");
  }

  @Override
  public String create(HttpRequest httpRequest) {
    var entity = toCreatedEntity(httpRequest);
    io.mateu.core.domain.out.fragmentmapper.mappers.ServerConstraintCheck.enforce(
        entity, httpRequest, true);
    return store().save(entity);
  }

  @Override
  public String getIdFieldForRow() {
    return getIdField(entityClass());
  }

  @Override
  @SuppressWarnings("unchecked")
  public ListingData<T> search(io.mateu.uidl.data.SearchRequest request, HttpRequest httpRequest) {
    var criteria = request.criteria();
    if (request.hasIds()) {
      // the store applies the id-set filter like any other list condition: on its id field
      criteria = new java.util.ArrayList<>(criteria);
      criteria.add(
          new io.mateu.uidl.data.FilterCriterion(
              getIdFieldForRow(),
              io.mateu.uidl.data.FilterOperator.in,
              List.copyOf(request.ids())));
    }
    return fetchRows(
        request.searchText(),
        (Filters) request.filters(),
        criteria,
        request.pageable(),
        httpRequest);
  }

  /** The data-access port for this crud's entity. */
  public abstract CrudStore<T> store();
}
