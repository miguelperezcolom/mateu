package io.mateu.mdd.ui.cruds.queries.sums;

import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.ui.cruds.queries.Query;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class SumsQuery extends Query {

  private List<FieldInterfaced> sumFields;

  public SumsQuery(
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
      List<FieldInterfaced> filterFields,
      List<FieldInterfaced> sumFields,
      List<FieldInterfaced> columnFields) {
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
    this.sumFields = sumFields;
  }

  public List<FieldInterfaced> getSumFields() {
    return sumFields;
  }
}
