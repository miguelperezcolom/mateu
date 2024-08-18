package io.mateu.core.domain.model.inbound.editors;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.util.Serializer;
import java.util.HashMap;
import java.util.Map;
import lombok.SneakyThrows;

@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class ObjectEditor {

  private Class type;
  private Map<String, Object> data = new HashMap<>();

  @SneakyThrows
  public ObjectEditor(
      Object entity, int __index, int __count, Serializer serializer, String listId) {
    this.type = entity.getClass();
    this.data = serializer.toMap(entity);
    if (__index >= 0) {
      this.data.put("__index", __index);
    }
    if (__count >= 0) {
      this.data.put("__count", __count);
    }
    if (listId != null) {
      this.data.put("__listId", listId);
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
