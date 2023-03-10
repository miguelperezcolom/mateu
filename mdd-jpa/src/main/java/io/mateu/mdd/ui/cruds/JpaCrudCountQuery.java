package io.mateu.mdd.ui.cruds;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.util.persistence.JPAHelper;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Query;
import java.util.List;
import java.util.Map;

@Slf4j
public class JpaCrudCountQuery extends JpaCrudQuery {

    JpaCrudCountQuery(MDDOpenCRUDAction action, Object filters, List<QuerySortOrder> sortOrders, int offset, int limit, Map<String, String> aliasedColumnNamesByColId, String queryFilters, ExtraFilters extraFilters, String selectColumnsForCount, String selectColumnsForList, Map<String, String> alias, Map<String, String> aliasedColumnNames, List<String> columnNames, List<String> aliasedColumnNamesList, List<FieldInterfaced> filterFields) {
        super(action, filters, sortOrders, offset, limit, aliasedColumnNamesByColId, queryFilters, extraFilters, selectColumnsForCount, selectColumnsForList, alias, aliasedColumnNames, columnNames, aliasedColumnNamesList, filterFields);
    }

    public int run() {
        final int[] count = {0};

        try {
            JPAHelper.notransact(em -> {

                Query q = buildQuery(
                        em,
                        selectColumnsForCount,
                        filters,
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

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return count[0];
    }

}
