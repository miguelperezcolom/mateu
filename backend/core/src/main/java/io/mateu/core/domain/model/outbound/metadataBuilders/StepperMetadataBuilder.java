package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.Stepper;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StepperMetadataBuilder {

  public Stepper build() {
    return new Stepper();
  }
}
