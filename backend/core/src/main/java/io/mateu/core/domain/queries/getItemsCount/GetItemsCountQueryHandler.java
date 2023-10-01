package io.mateu.core.domain.queries.getItemsCount;

import io.mateu.core.domain.queries.EntitiesFinder;
import io.mateu.mdd.shared.data.ItemsListProvider;
import io.mateu.reflection.ReflectionHelper;
import jakarta.persistence.Entity;
import java.lang.reflect.InvocationTargetException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GetItemsCountQueryHandler {

  public int run(GetItemsCountQuery query) throws Throwable {
    String itemsProviderId = query.getItemsProviderId();
    String searchText = query.getSearchText();

    Class type = Class.forName(itemsProviderId);
    if (ItemsListProvider.class.isAssignableFrom(type)) {
      return ((ItemsListProvider) ReflectionHelper.newInstance(type)).count(searchText);
    }
    if (type.isAnnotationPresent(Entity.class)) {
      return countEntities(type, searchText);
    }
    throw new Exception("No item provider with id " + itemsProviderId);
  }

  private int countEntities(Class entityClass, String searchText)
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException,
          InstantiationException {
    return ReflectionHelper.newInstance(EntitiesFinder.class)
        .countEntities(entityClass, searchText);
  }
}
