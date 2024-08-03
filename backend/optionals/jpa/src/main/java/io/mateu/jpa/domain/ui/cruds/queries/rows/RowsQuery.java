package io.mateu.jpa.domain.ui.cruds.queries.rows;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinition.core.views.ExtraFilters;
import io.mateu.dtos.SortCriteria;
import io.mateu.jpa.domain.ui.cruds.queries.Query;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class RowsQuery extends Query {

  private int offset;
  private int limit;
  private List<SortCriteria> sortOrders;

  public RowsQuery(
      MDDOpenCRUDAction action,
      Object filters,
      List<SortCriteria> sortOrders,
      int offset,
      int limit,
      Map<String, String> aliasedColumnNamesByColId,
      String queryFilters,
      ExtraFilters extraFilters,
      String selectColumnsForCount,
      String selectColumnsForList,
      Map<String, String> alias,
      Map<String, String> aliasedColumnNames,
      List<String> columnNames,
      List<String> aliasedColumnNamesList,
      List<Field> filterFields,
      List<Field> columnFields) {
    super(
        action,
        filters,
        sortOrders,
        offset,
        limit,
        aliasedColumnNamesByColId,
        queryFilters,
        extraFilters,
        selectColumnsForCount,
        selectColumnsForList,
        alias,
        aliasedColumnNames,
        columnNames,
        aliasedColumnNamesList,
        filterFields,
        columnFields);
    this.offset = offset;
    this.limit = limit;
    this.sortOrders = sortOrders;
  }
}
