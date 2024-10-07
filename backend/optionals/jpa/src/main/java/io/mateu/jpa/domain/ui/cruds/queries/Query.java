package io.mateu.jpa.domain.ui.cruds.queries;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinition.core.views.ExtraFilters;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Pageable;

@AllArgsConstructor
@Getter
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public abstract class Query {

  private MDDOpenCRUDAction action;
  private String searchtext;
  private Object filters;
  private Pageable pageable;
  private Map<String, String> aliasedColumnNamesByColId;
  private String queryFilters;
  private ExtraFilters extraFilters;
  private String selectColumnsForCount;
  private String selectColumnsForList;
  private Map<String, String> alias;
  private Map<String, String> aliasedColumnNames;
  private List<String> columnNames;
  private List<String> aliasedColumnNamesList;
  private List<Field> filterFields;
  private List<Field> columnFields;
}
