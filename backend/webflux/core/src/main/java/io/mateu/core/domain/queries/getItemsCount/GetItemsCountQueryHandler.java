package io.mateu.core.domain.queries.getItemsCount;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.queries.EntitiesFinder;
import io.mateu.uidl.data.ItemsListProvider;
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

  final ReflectionService reflectionService;

  public int run(GetItemsCountQuery query) throws Throwable {
    String itemsProviderId = query.getItemsProviderId();
    String searchText = query.getSearchText();

    Class type = Class.forName(itemsProviderId);
    if (ItemsListProvider.class.isAssignableFrom(type)) {
      return ((ItemsListProvider) reflectionService.newInstance(type)).count(searchText);
    }
    if (type.isAnnotationPresent(Entity.class)) {
      return countEntities(type, searchText);
    }
    throw new Exception("No item provider with targetId " + itemsProviderId);
  }

  private int countEntities(Class entityClass, String searchText)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    return reflectionService
        .newInstance(EntitiesFinder.class)
        .countEntities(entityClass, searchText);
  }
}
