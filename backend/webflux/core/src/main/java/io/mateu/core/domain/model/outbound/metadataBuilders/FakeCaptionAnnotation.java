package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.uidl.annotations.Caption;
import java.lang.annotation.Annotation;

public class FakeCaptionAnnotation implements Caption {

  String value = "";

  public FakeCaptionAnnotation(String value) {
    this.value = value;
  }

  public FakeCaptionAnnotation() {}

  @Override
  public String value() {
    return value;
  }

  @Override
  public Class<? extends Annotation> annotationType() {
    return Caption.class;
  }
}
