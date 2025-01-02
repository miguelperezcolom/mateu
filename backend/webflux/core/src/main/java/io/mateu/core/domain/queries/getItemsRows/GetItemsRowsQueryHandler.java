package io.mateu.core.domain.queries.getItemsRows;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.queries.EntitiesFinder;
import io.mateu.dtos.ValueDto;
import io.mateu.uidl.data.ItemsListProvider;
import jakarta.persistence.Entity;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class GetItemsRowsQueryHandler {

  final ReflectionService reflectionService;

  public List<ValueDto> run(GetItemsRowsQuery query) throws Throwable {
    String itemsProviderId = query.getItemsProviderId();
    String searchText = query.getSearchText();
    int page = query.getPage();
    int pageSize = query.getPageSize();

    Class type = Class.forName(itemsProviderId);
    if (ItemsListProvider.class.isAssignableFrom(type)) {
      return ((ItemsListProvider) reflectionService.newInstance(type))
          .find(searchText, page, pageSize).stream()
              .map(v -> new ValueDto(v.key(), v.value()))
              .toList();
    }
    if (type.isAnnotationPresent(Entity.class)) {
      return findEntities(type, searchText, page, pageSize);
    }
    throw new Exception("No item provider with targetId " + itemsProviderId);
  }

  private List<ValueDto> findEntities(Class entityClass, String searchText, int page, int pageSize)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    return reflectionService
        .newInstance(EntitiesFinder.class)
        .findEntities(entityClass, searchText, page, pageSize);
  }
}
