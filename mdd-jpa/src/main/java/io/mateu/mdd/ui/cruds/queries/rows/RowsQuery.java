package io.mateu.mdd.ui.cruds.queries.rows;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.ui.cruds.queries.Query;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.stream.Collectors;


@Slf4j
public class RowsQuery extends Query {

    private int offset;
    private int limit;
    private List<QuerySortOrder> sortOrders;

    public RowsQuery(MDDOpenCRUDAction action, Object filters, List<QuerySortOrder> sortOrders, int offset, int limit, Map<String, String> aliasedColumnNamesByColId, String queryFilters, ExtraFilters extraFilters, String selectColumnsForCount, String selectColumnsForList, Map<String, String> alias, Map<String, String> aliasedColumnNames, List<String> columnNames, List<String> aliasedColumnNamesList, List<FieldInterfaced> filterFields) {
        super(action, filters, sortOrders, offset, limit, aliasedColumnNamesByColId, queryFilters, extraFilters, selectColumnsForCount, selectColumnsForList, alias, aliasedColumnNames, columnNames, aliasedColumnNamesList, filterFields);
        this.offset = offset;
        this.limit = limit;
        this.sortOrders = sortOrders;
    }

}
