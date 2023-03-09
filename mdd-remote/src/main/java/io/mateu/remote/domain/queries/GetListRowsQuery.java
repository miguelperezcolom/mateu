package io.mateu.remote.domain.queries;

import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.remote.domain.JourneyStoreAccessor;
import io.mateu.remote.dtos.SortCriteria;
import io.mateu.remote.dtos.SortType;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class GetListRowsQuery {

    private String journeyId;

    private String stepId;

    private String componentId;

    private String listId;

    private Object filters;

    private int page;

    private int pageSize;

    private List<SortCriteria> ordering;

    public List<Object> run() throws Throwable {
        RpcView rpcView = (RpcView) JourneyStoreAccessor.get().getViewInstance(stepId);
        return rpcView.rpc(filters, buildSortOrders(), page * pageSize, (page + 1) * pageSize - 1);
    }

    private List<QuerySortOrder> buildSortOrders() {
        return ordering.stream().map(c ->
                new QuerySortOrder(c.getColumn(), toVaadinSortDirection(c.getOrder())))
                .collect(Collectors.toList());
    }

    private SortDirection toVaadinSortDirection(SortType order) {
        if (SortType.Descending.equals(order)) {
            return SortDirection.DESCENDING;
        }
        return SortDirection.ASCENDING;
    }


}
