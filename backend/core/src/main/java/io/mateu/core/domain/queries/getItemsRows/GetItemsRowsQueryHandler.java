package io.mateu.core.domain.queries.getItemsRows;

import io.mateu.core.domain.queries.EntitiesFinder;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.data.ItemsListProvider;
import io.mateu.core.domain.uidefinition.shared.data.Value;
import jakarta.persistence.Entity;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetItemsRowsQueryHandler {

  final ReflectionHelper reflectionHelper;

  public List<Value> run(GetItemsRowsQuery query) throws Throwable {
    String itemsProviderId = query.getItemsProviderId();
    String searchText = query.getSearchText();
    int page = query.getPage();
    int pageSize = query.getPageSize();

    Class type = Class.forName(itemsProviderId);
    if (ItemsListProvider.class.isAssignableFrom(type)) {
      return ((ItemsListProvider) reflectionHelper.newInstance(type))
          .find(searchText, page, pageSize);
    }
    if (type.isAnnotationPresent(Entity.class)) {
      return findEntities(type, searchText, page, pageSize);
    }
    throw new Exception("No item provider with id " + itemsProviderId);
  }

  private List<Value> findEntities(Class entityClass, String searchText, int page, int pageSize)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    return reflectionHelper
        .newInstance(EntitiesFinder.class)
        .findEntities(entityClass, searchText, page, pageSize);
  }
}
