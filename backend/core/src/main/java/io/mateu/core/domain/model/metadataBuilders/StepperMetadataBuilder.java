package io.mateu.core.domain.model.metadataBuilders;

import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import io.mateu.dtos.Stepper;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StepperMetadataBuilder {

  @Autowired FieldMetadataBuilder fieldMetadataBuilder;

  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Stepper build(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
    Stepper stepper = Stepper.builder().dataPrefix("").build();
    return stepper;
  }
}
