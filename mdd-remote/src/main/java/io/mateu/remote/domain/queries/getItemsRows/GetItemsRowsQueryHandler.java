package io.mateu.remote.domain.queries.getItemsRows;

import io.mateu.mdd.shared.data.ItemsListProvider;
import io.mateu.mdd.shared.data.Value;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.queries.EntitiesFinder;
import jakarta.persistence.Entity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

@Service
@Slf4j
public class GetItemsRowsQueryHandler {

    public List<Value> run(GetItemsRowsQuery query) throws Throwable {
        String itemsProviderId = query.getItemsProviderId();
        String searchText = query.getSearchText();
        int page = query.getPage();
        int pageSize = query.getPageSize();

        Class type = Class.forName(itemsProviderId);
        if (ItemsListProvider.class.isAssignableFrom(type)) {
            return ((ItemsListProvider) ReflectionHelper.newInstance(type))
                    .find(searchText, page, pageSize);
        }
        if (type.isAnnotationPresent(Entity.class)) {
            return findEntities(type, searchText, page, pageSize);
        }
        throw new Exception("No item provider with id " + itemsProviderId);
    }

    private List<Value> findEntities(Class entityClass, String searchText, int page, int pageSize) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException, InstantiationException {
        return ReflectionHelper.newInstance(EntitiesFinder.class).findEntities(entityClass, searchText, page, pageSize);
    }

}
