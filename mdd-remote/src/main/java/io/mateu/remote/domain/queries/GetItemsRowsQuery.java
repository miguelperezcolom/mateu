package io.mateu.remote.domain.queries;

import io.mateu.mdd.shared.data.ItemsListProvider;
import io.mateu.mdd.shared.data.Value;
import io.mateu.reflection.ReflectionHelper;
import jakarta.persistence.Entity;
import lombok.*;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class GetItemsRowsQuery {

    private String itemsProviderId;

    private String searchText;

    private int page;

    private int pageSize;

    public List<Value> run() throws Throwable {
        Class type = Class.forName(itemsProviderId);
        if (ItemsListProvider.class.isAssignableFrom(type)) {
            return ((ItemsListProvider)ReflectionHelper.newInstance(type))
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
