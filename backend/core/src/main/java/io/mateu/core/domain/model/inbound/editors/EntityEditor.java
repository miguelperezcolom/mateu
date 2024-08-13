package io.mateu.core.domain.model.inbound.editors;

import java.util.HashMap;
import java.util.Map;

public class EntityEditor {

  private Class entityClass;
  private Map<String, Object> data = new HashMap<>();

  public EntityEditor(Object entity, int __index, int __count, Object id, Map<String, Object> data)
      throws Exception {
    this.entityClass = entity.getClass();
    this.data = data;
    this.data.put("__id", id);
    if (__index >= 0) {
      this.data.put("__index", __index);
    }
    if (__count >= 0) {
      this.data.put("__count", __count);
    }
  }

  public EntityEditor() {}

  public void setEntityClass(Class entityClass) {
    this.entityClass = entityClass;
  }

  public void setData(Map<String, Object> data) {
    this.data.putAll(data);
  }

  public Class getEntityClass() {
    return entityClass;
  }

  public Map<String, Object> getData() {
    return data;
  }

  @Override
  public String toString() {
    if (data.containsKey("__toString")) {
      return (String) data.get("__toString");
    }
    if (data.containsKey("name")) {
      return (String) data.get("name");
    }
    return entityClass.getSimpleName();
  }
}
