package io.mateu.jpa.domain.ui.cruds.queries.count;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.jpa.domain.ui.cruds.queries.Query;
import io.mateu.uidl.app.MDDOpenCRUDAction;
import io.mateu.uidl.views.ExtraFilters;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;

@Slf4j
public class CountQuery extends Query {

  public CountQuery(
      MDDOpenCRUDAction action,
      String searchtext,
      Object filters,
      Pageable pageable,
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
        searchtext,
        filters,
        pageable,
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
  }
}
