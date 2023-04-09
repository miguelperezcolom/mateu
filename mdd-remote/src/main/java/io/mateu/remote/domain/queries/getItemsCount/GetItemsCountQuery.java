package io.mateu.remote.domain.queries.getItemsCount;

import io.mateu.mdd.shared.data.ItemsListProvider;
import io.mateu.mdd.shared.data.Value;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.queries.EntitiesFinder;
import jakarta.persistence.Entity;
import lombok.*;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
public class GetItemsCountQuery {

    private String itemsProviderId;

    private String searchText;

}
