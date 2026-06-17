package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.getIdField;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.declarative.SimpleView;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.*;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;

public abstract class FilteredAutoCrud<Filters, T extends Identifiable>
    extends Crud<SimpleView<T>, SimpleView<T>, SimpleView<T>, Filters, T, String> {

  @Override
  public String toId(String id) {
    return id;
  }

  @Override
  public CrudAdapter<SimpleView<T>, SimpleView<T>, Filters, T, String> adapter() {
    return new CrudAdapter<>() {
      @Override
      public ListingData<T> search(
          String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
        return fetchRows(searchText, filters, pageable, httpRequest);
      }

      @Override
      public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
        repository().deleteAllById(selectedIds);
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

  public ListingData<T> fetchRows(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
    var all =
        repository().findAll().stream()
            .filter(
                item ->
                    searchText == null
                        || searchText.isEmpty()
                        || (item instanceof Searchable searchable
                                ? searchable.searchableText()
                                : item.toString())
                            .toLowerCase()
                            .contains(searchText.toLowerCase()))
            .toList();
    int pageSize = pageable != null && pageable.size() > 0 ? pageable.size() : all.size();
    int pageNumber = pageable != null ? pageable.page() : 0;
    int from = Math.min(pageNumber * pageSize, all.size());
    int to = Math.min(from + pageSize, all.size());
    return new ListingData<>(
        new Page<>("", pageSize, pageNumber, all.size(), all.subList(from, to)));
  }

  public AutoNamedView<T> buildNamedView(String id, HttpRequest httpRequest) {
    var entity = repository().findById(id).orElseThrow();
    return new AutoNamedView<>(entityClass(), entity, repository());
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
    return new AutoNamedView<>(entityClass(), (T) instance, repository());
  }

  @SneakyThrows
  @SuppressWarnings("unchecked")
  T toEntity(HttpRequest httpRequest) {
    var initiatorState =
        (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
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

  public abstract CrudRepository<T> repository();
}
