package io.mateu.mdd.ui.cruds.queries.rows;

import io.mateu.mdd.ui.cruds.queries.QueryHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
                jakarta.persistence.Query q = new QueryHelper().buildJpaQuery(query, em,
                        query.getSelectColumnsForList(), query.getFilters(),
                        query.getSortOrders(), null,
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
                map.put("col" + i, values[i]);
            }
        }
        return map;
    }

}
