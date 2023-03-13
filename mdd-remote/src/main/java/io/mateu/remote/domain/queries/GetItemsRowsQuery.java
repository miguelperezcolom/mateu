package io.mateu.remote.domain.queries;

import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;
import io.mateu.mdd.shared.data.ItemsListProvider;
import io.mateu.mdd.shared.data.Value;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.JourneyStoreAccessor;
import io.mateu.remote.dtos.SortCriteria;
import io.mateu.remote.dtos.SortType;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

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
