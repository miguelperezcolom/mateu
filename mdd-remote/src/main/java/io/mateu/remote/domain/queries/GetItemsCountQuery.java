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
public class GetItemsCountQuery {

    private String itemsProviderId;

    private String searchText;

    public int run() throws Throwable {
        Class type = Class.forName(itemsProviderId);
        if (ItemsListProvider.class.isAssignableFrom(type)) {
            return ((ItemsListProvider)ReflectionHelper.newInstance(type))
                    .count(searchText);
        }
        if (type.isAnnotationPresent(Entity.class)) {
            return countEntities(type, searchText);
        }
        throw new Exception("No item provider with id " + itemsProviderId);
    }

    private int countEntities(Class entityClass, String searchText) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException, InstantiationException {
        return ReflectionHelper.newInstance(EntitiesFinder.class).countEntities(entityClass, searchText);
    }
}
