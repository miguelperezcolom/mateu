package io.mateu.jpa.domain.ui.cruds.queries.rows;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.jpa.domain.ui.cruds.queries.Query;
import io.mateu.uidl.app.MDDOpenCRUDAction;
import io.mateu.uidl.views.ExtraFilters;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;

@Slf4j
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class RowsQuery extends Query {

  public RowsQuery(
      MDDOpenCRUDAction action,
      String searchText,
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
        searchText,
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
