package io.mateu.mdd.ui.cruds.queries.count;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.ui.cruds.queries.Query;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@Slf4j
public class CountQuery extends Query {

    public CountQuery(MDDOpenCRUDAction action, Object filters, List<QuerySortOrder> sortOrders, int offset, int limit, Map<String, String> aliasedColumnNamesByColId, String queryFilters, ExtraFilters extraFilters, String selectColumnsForCount, String selectColumnsForList, Map<String, String> alias, Map<String, String> aliasedColumnNames, List<String> columnNames, List<String> aliasedColumnNamesList, List<FieldInterfaced> filterFields) {
        super(action, filters, sortOrders, offset, limit, aliasedColumnNamesByColId, queryFilters, extraFilters, selectColumnsForCount, selectColumnsForList, alias, aliasedColumnNames, columnNames, aliasedColumnNamesList, filterFields);
    }

}
