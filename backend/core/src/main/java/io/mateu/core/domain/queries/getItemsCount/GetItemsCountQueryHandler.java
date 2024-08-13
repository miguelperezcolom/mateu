package io.mateu.core.domain.queries.getItemsCount;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.queries.EntitiesFinder;
import io.mateu.core.domain.uidefinition.shared.data.ItemsListProvider;
import jakarta.persistence.Entity;
import java.lang.reflect.InvocationTargetException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class GetItemsCountQueryHandler {

  final ReflectionHelper reflectionHelper;

  public int run(GetItemsCountQuery query) throws Throwable {
    String itemsProviderId = query.getItemsProviderId();
    String searchText = query.getSearchText();

    Class type = Class.forName(itemsProviderId);
    if (ItemsListProvider.class.isAssignableFrom(type)) {
      return ((ItemsListProvider) reflectionHelper.newInstance(type)).count(searchText);
    }
    if (type.isAnnotationPresent(Entity.class)) {
      return countEntities(type, searchText);
    }
    throw new Exception("No item provider with id " + itemsProviderId);
  }

  private int countEntities(Class entityClass, String searchText)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    return reflectionHelper
        .newInstance(EntitiesFinder.class)
        .countEntities(entityClass, searchText);
  }
}
