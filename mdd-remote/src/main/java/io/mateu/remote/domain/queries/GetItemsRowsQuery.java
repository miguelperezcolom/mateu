package io.mateu.remote.domain.queries;

import io.mateu.mdd.shared.data.ItemsListProvider;
import io.mateu.mdd.shared.data.Value;
import io.mateu.reflection.ReflectionHelper;
import lombok.*;

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
        return ((ItemsListProvider)ReflectionHelper.newInstance(Class.forName(itemsProviderId)))
                .find(searchText, page, pageSize);
    }

}
