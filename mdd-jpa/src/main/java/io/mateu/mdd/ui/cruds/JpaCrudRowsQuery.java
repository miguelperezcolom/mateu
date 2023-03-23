package io.mateu.mdd.ui.cruds;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.util.persistence.JPAHelper;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Query;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
public class JpaCrudRowsQuery extends JpaCrudQuery {

    private int offset;
    private int limit;
    private List<QuerySortOrder> sortOrders;

    JpaCrudRowsQuery(MDDOpenCRUDAction action, Object filters, List<QuerySortOrder> sortOrders, int offset, int limit, Map<String, String> aliasedColumnNamesByColId, String queryFilters, ExtraFilters extraFilters, String selectColumnsForCount, String selectColumnsForList, Map<String, String> alias, Map<String, String> aliasedColumnNames, List<String> columnNames, List<String> aliasedColumnNamesList, List<FieldInterfaced> filterFields) {
        super(action, filters, sortOrders, offset, limit, aliasedColumnNamesByColId, queryFilters, extraFilters, selectColumnsForCount, selectColumnsForList, alias, aliasedColumnNames, columnNames, aliasedColumnNamesList, filterFields);
        this.offset = offset;
        this.limit = limit;
        this.sortOrders = sortOrders;
    }

    public List run() {
        List l = new ArrayList();

        try {
            JPAHelper.notransact(em -> {

                ArrayList<QuerySortOrder> mappedSortOrders = new ArrayList<>();
                if (sortOrders != null) {
                    for (QuerySortOrder sortOrder : sortOrders) {
                        mappedSortOrders.add(
                                new QuerySortOrder(aliasedColumnNames.get(sortOrder.getSorted()),
                                        sortOrder.getDirection()));
                    }
                }

                Query q = buildQuery(em, selectColumnsForList, filters, mappedSortOrders, null,
                        offset, limit, true);

                l.addAll((Collection) q.getResultList().stream().map(raw -> toMap((Object[]) raw)).collect(Collectors.toList()));

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return l;

    }

    private Map toMap(Object[] values) {
        Map map = new HashMap();
        if (values != null) {
            for (int i = 0; i < values.length; i++) {
                map.put(aliasedColumnNamesList.get(i), values[i]);
            }
        }
        return map;
    }

}
