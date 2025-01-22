package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.uidl.annotations.Label;
import java.lang.annotation.Annotation;

public class FakeLabelAnnotation implements Label {

  String value = "";

  public FakeLabelAnnotation(String value) {
    this.value = value;
  }

  public FakeLabelAnnotation() {}

  @Override
  public String value() {
    return value;
  }

  @Override
  public Class<? extends Annotation> annotationType() {
    return Label.class;
  }
}
