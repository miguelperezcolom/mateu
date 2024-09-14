package io.mateu.jpa.domain.ui.cruds.queries.sums;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinition.core.views.ExtraFilters;
import io.mateu.dtos.SortCriteria;
import io.mateu.jpa.domain.ui.cruds.queries.Query;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class SumsQuery extends Query {

  private final List<Field> sumFields;

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
      List<Field> filterFields,
      List<Field> sumFields,
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
    this.sumFields = sumFields;
  }

  public List<Field> getSumFields() {
    return sumFields;
  }
}
