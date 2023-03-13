package io.mateu.remote.domain.queries;

import io.mateu.mdd.shared.data.ItemsListProvider;
import io.mateu.reflection.ReflectionHelper;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class GetItemsCountQuery {

    private String itemsProviderId;

    private String searchText;

    public int run() throws Throwable {
        return ((ItemsListProvider)ReflectionHelper.newInstance(Class.forName(itemsProviderId)))
                .count(searchText);
    }

}
