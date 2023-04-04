package io.mateu.mdd.ui.cruds.queries.count;

import io.mateu.mdd.ui.cruds.queries.QueryHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

@Service
@Slf4j
public class CountQueryHandler {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public int run(CountQuery query) {
        final int[] count = {0};

        try {
            Query q = new QueryHelper().buildJpaQuery(
                    query,
                    em,
                    query.getSelectColumnsForCount(),
                    query.getFilters(),
                    null,
                    null,
                    0,
                    1000,
                    false);
            log.debug(q.toString());

            Object r = q.getSingleResult();

            if (r instanceof Long) {
                count[0] = ((Long) r).intValue();
            } else if (r instanceof Object[]) {
                Object[] v = (Object[]) r;

                count[0] = ((Long) v[0]).intValue();
            }
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return count[0];
    }

}
