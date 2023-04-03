package io.mateu.mdd.ui.cruds.queries.rows;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.ui.cruds.queries.QueryHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RowsQueryHandler {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public List run(RowsQuery query) {
        List l = new ArrayList();

        try {
                ArrayList<QuerySortOrder> mappedSortOrders = new ArrayList<>();
                if (query.getSortOrders() != null) {
                    for (QuerySortOrder sortOrder : query.getSortOrders()) {
                        mappedSortOrders.add(
                                new QuerySortOrder(query.getAliasedColumnNames().get(sortOrder.getSorted()),
                                        sortOrder.getDirection()));
                    }
                }

                javax.persistence.Query q = new QueryHelper().buildJpaQuery(query, em,
                        query.getSelectColumnsForList(), query.getFilters(),
                        mappedSortOrders, null,
                        query.getOffset(), query.getLimit(), true);

                l.addAll((Collection) q.getResultList().stream().map(raw -> toMap(query, (Object[]) raw))
                        .collect(Collectors.toList()));
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return l;

    }

    private Map toMap(RowsQuery query, Object[] values) {
        Map map = new HashMap();
        if (values != null) {
            for (int i = 0; i < values.length; i++) {
                map.put(query.getAliasedColumnNamesList().get(i), values[i]);
            }
        }
        return map;
    }

}
