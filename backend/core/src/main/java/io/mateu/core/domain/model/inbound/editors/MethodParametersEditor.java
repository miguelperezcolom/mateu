package io.mateu.core.domain.model.inbound.editors;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.util.Serializer;
import java.util.Map;
import lombok.SneakyThrows;

@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class MethodParametersEditor {

  private String methodId;
  private Class type;
  private Map<String, Object> data;

  public MethodParametersEditor(Class type, String methodId, Map<String, Object> data) {
    this.type = type;
    this.data = data;
    this.methodId = methodId;
  }

  @SneakyThrows
  public MethodParametersEditor(Object entity, String methodId, Serializer serializer) {
    this.type = entity.getClass();
    this.data = serializer.toMap(entity);
    this.methodId = methodId;
  }

  public MethodParametersEditor() {}

  public void setType(Class type) {
    this.type = type;
  }

  public void setData(Map<String, Object> data) {
    this.data = data;
  }

  public Class getType() {
    return type;
  }

  public Map<String, Object> getData() {
    return data;
  }

  public String getMethodId() {
    return methodId;
  }

  public void setMethodId(String methodId) {
    this.methodId = methodId;
  }
}
