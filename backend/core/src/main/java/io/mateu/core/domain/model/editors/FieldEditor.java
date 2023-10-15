package io.mateu.core.domain.model.editors;

import io.mateu.util.Serializer;
import java.util.Map;

public class FieldEditor {

  private String initialStep;
  private String fieldId;
  private Class type;
  private Map<String, Object> data;

  public FieldEditor(Object entity, String fieldId, String initialStep) throws Exception {
    this.type = entity.getClass();
    this.data = Serializer.toMap(entity);
    this.initialStep = initialStep;
    this.fieldId = fieldId;
  }

  public FieldEditor() {}

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

  public String getFieldId() {
    return fieldId;
  }

  public void setFieldId(String fieldId) {
    this.fieldId = fieldId;
  }
}
