package io.mateu.uidl.app;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.uidl.views.ExtraFilters;
import java.util.Map;

@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class MDDOpenCRUDAction extends AbstractAction {

  private Class entityClass;
  private String queryFilters;
  private ExtraFilters extraFilters;
  private Map<String, Object> defaultValues;
  private String columns;
  private String fields;
  private String readOnlyFields;
  private String filters;
  private boolean canAdd = true;
  private boolean canDelete = true;
  private boolean readOnly;

  public MDDOpenCRUDAction() {
    super();
  }

  public MDDOpenCRUDAction(String name, Class entityClass) {
    super(name);
    this.entityClass = entityClass;
  }

  public MDDOpenCRUDAction(Class entityClass) {
    super(null);
    this.entityClass = entityClass;
  }

  public MDDOpenCRUDAction setQueryFilters(String queryFilters) {
    this.queryFilters = queryFilters;
    return this;
  }

  public MDDOpenCRUDAction setExtraFilters(ExtraFilters extraFilters) {
    this.extraFilters = extraFilters;
    return this;
  }

  public MDDOpenCRUDAction setDefaultValues(Map<String, Object> defaultValues) {
    this.defaultValues = defaultValues;
    return this;
  }

  public MDDOpenCRUDAction setColumns(String columns) {
    this.columns = columns;
    return this;
  }

  public MDDOpenCRUDAction setFields(String fields) {
    this.fields = fields;
    return this;
  }

  public MDDOpenCRUDAction setFilters(String filters) {
    this.filters = filters;
    return this;
  }

  public MDDOpenCRUDAction setReadOnlyFields(String fields) {
    this.readOnlyFields = fields;
    return this;
  }

  public MDDOpenCRUDAction setCanAdd(boolean canAdd) {
    this.canAdd = canAdd;
    return this;
  }

  public MDDOpenCRUDAction setCanDelete(boolean canDelete) {
    this.canDelete = canDelete;
    return this;
  }

  public MDDOpenCRUDAction setReadOnly(boolean readOnly) {
    this.readOnly = readOnly;
    return this;
  }

  public Class getEntityClass() {
    return entityClass;
  }

  public String getQueryFilters() {
    return queryFilters;
  }

  public ExtraFilters getExtraFilters() {
    return extraFilters;
  }

  public Map<String, Object> getDefaultValues() {
    return defaultValues;
  }

  public String getColumns() {
    return columns;
  }

  public String getFields() {
    return fields;
  }

  public String getReadOnlyFields() {
    return readOnlyFields;
  }

  public String getFilters() {
    return filters;
  }

  public boolean isCanAdd() {
    return canAdd;
  }

  public boolean isCanDelete() {
    return canDelete;
  }

  public boolean isReadOnly() {
    return readOnly;
  }
}
