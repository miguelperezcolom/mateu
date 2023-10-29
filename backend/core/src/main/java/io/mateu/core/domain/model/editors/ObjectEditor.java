package io.mateu.core.domain.model.editors;

import io.mateu.util.Serializer;
import java.util.HashMap;
import java.util.Map;

public class ObjectEditor {

  private Class type;
  private Map<String, Object> data = new HashMap<>();

  public ObjectEditor(Object entity, int __index, int __count, Serializer serializer) throws Exception {
    this.type = entity.getClass();
    this.data = serializer.toMap(entity);
    if (__index >= 0) {
      this.data.put("__index", __index);
    }
    if (__count >= 0) {
      this.data.put("__count", __count);
    }
  }

  public ObjectEditor() {}

  public void setType(Class type) {
    this.type = type;
  }

  public void setData(Map<String, Object> data) {
    this.data.putAll(data);
  }

  public Class getType() {
    return type;
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
    return type.getSimpleName();
  }
}
