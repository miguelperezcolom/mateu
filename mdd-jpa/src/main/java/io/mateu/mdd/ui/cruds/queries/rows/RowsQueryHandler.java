package io.mateu.mdd.ui.cruds.queries.rows;

import io.mateu.mdd.ui.cruds.queries.QueryHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import reactor.core.publisher.Flux;

import java.lang.reflect.InvocationTargetException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RowsQueryHandler {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Flux run(RowsQuery query) {
        try {
            jakarta.persistence.Query q = new QueryHelper().buildJpaQuery(query, em,
                    query.getSelectColumnsForList(), query.getFilters(),
                    query.getSortOrders(), null,
                    query.getOffset(), query.getLimit(), true);

            return Flux.fromStream(q.getResultStream().map(raw -> toMap(query, (Object[]) raw)));
        } catch (Exception e) {
            return Flux.error(e);
        }
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
