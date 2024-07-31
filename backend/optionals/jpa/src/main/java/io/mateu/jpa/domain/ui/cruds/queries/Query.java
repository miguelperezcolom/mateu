package io.mateu.jpa.domain.ui.cruds.queries;

import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinition.core.views.ExtraFilters;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import io.mateu.dtos.SortCriteria;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public abstract class Query {

  private MDDOpenCRUDAction action;
  private Object filters;
  private List<SortCriteria> sortOrders;
  private int offset;
  private int limit;
  private Map<String, String> aliasedColumnNamesByColId;
  private String queryFilters;
  private ExtraFilters extraFilters;
  private String selectColumnsForCount;
  private String selectColumnsForList;
  private Map<String, String> alias;
  private Map<String, String> aliasedColumnNames;
  private List<String> columnNames;
  private List<String> aliasedColumnNamesList;
  private List<FieldInterfaced> filterFields;
  private List<FieldInterfaced> columnFields;
}
