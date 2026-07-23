package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.getIdField;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.*;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;

public abstract class FilteredAutoCrud<Filters, T extends Identifiable>
    extends Crud<AutoNamedView<T>, AutoNamedView<T>, AutoNamedView<T>, Filters, T, String> {

  @Override
  public String toId(String id) {
    return id;
  }

  @Override
  public CrudAdapter<AutoNamedView<T>, AutoNamedView<T>, Filters, T, String> adapter() {
    return new CrudAdapter<>() {
      @Override
      public ListingData<T> search(
          String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
        return fetchRows(searchText, filters, pageable, httpRequest);
      }

      @Override
      public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
        store().deleteAllById(selectedIds);
      }

      @Override
      public Object getView(String id, HttpRequest httpRequest) {
        return buildNamedView(id, httpRequest);
      }

      @Override
      public Object getEditor(String id, HttpRequest httpRequest) {
        return buildNamedView(id, httpRequest);
      }

      @Override
      public Object getCreationForm(HttpRequest httpRequest) {
        return buildCreationForm(httpRequest);
      }
    };
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

  public AutoNamedView<T> buildNamedView(String id, HttpRequest httpRequest) {
    var entity = store().findById(id).orElseThrow();
    return new AutoNamedView<>(entityClass(), entity, store());
  }

  @SneakyThrows
  @SuppressWarnings("unchecked")
  public AutoNamedView<T> buildCreationForm(HttpRequest httpRequest) {
    Map<String, Object> data = Map.of();
    if ("create".equals(httpRequest.runActionRq().actionId())) {
      if (httpRequest.runActionRq().parameters() != null
          && httpRequest.runActionRq().parameters().containsKey("initiatorState")) {
        data = (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
      }
    }
    var instance =
        MateuBeanProvider.getBean(InstanceFactory.class)
            .newInstance(entityClass(), data, httpRequest);
    return new AutoNamedView<>(entityClass(), (T) instance, store());
  }

  @SneakyThrows
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
  public Object save(HttpRequest httpRequest) {
    var entity = toEntity(httpRequest);
    buildNamedView(entity.id(), httpRequest).save(httpRequest);
    return entity.id();
  }

  @Override
  @SuppressWarnings("unchecked")
  public Object updateRow(Map<String, Object> row, HttpRequest httpRequest) {
    var entity = (T) MateuInstanceFactory.newInstance(entityClass(), row, httpRequest);
    OptimisticLock.check(entity, store().findById(entity.id()), httpRequest);
    OptimisticLock.bump(entity);
    store().save(entity);
    return io.mateu.uidl.data.Message.success("Saved");
  }

  @Override
  public Object saveNew(HttpRequest httpRequest) {
    return buildCreationForm(httpRequest).create(httpRequest);
  }

  @Override
  public String getIdFieldForRow() {
    return getIdField(entityClass());
  }

  @Override
  public Object search(
      String searchText, Object filters, Pageable pageable, HttpRequest httpRequest) {
    return adapter().search(searchText, (Filters) filters, pageable, httpRequest);
  }

  @Override
  @SuppressWarnings("unchecked")
  public Object search(
      String searchText,
      Object filters,
      List<io.mateu.uidl.data.FilterCriterion> criteria,
      Pageable pageable,
      HttpRequest httpRequest) {
    return fetchRows(searchText, (Filters) filters, criteria, pageable, httpRequest);
  }

  /** The data-access port for this crud's entity. */
  public abstract CrudStore<T> store();
}
