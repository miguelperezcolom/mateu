package io.mateu.core.domain.model.inbound.editors;

import io.mateu.core.domain.model.util.Serializer;
import java.util.Map;

public class MethodParametersEditor {

  private String initialStep;
  private String methodId;
  private Class type;
  private Map<String, Object> data;

  public MethodParametersEditor(
      Class type, String methodId, String initialStep, Map<String, Object> data) throws Exception {
    this.type = type;
    this.data = data;
    this.initialStep = initialStep;
    this.methodId = methodId;
  }

  public MethodParametersEditor(
      Object entity, String methodId, String initialStep, Serializer serializer) throws Exception {
    this.type = entity.getClass();
    this.data = serializer.toMap(entity);
    this.initialStep = initialStep;
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

  public String getInitialStep() {
    return initialStep;
  }

  public void setInitialStep(String initialStep) {
    this.initialStep = initialStep;
  }

  public String getMethodId() {
    return methodId;
  }

  public void setMethodId(String methodId) {
    this.methodId = methodId;
  }
}
