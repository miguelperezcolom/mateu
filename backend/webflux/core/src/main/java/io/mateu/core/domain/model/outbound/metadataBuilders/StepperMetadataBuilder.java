package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.dtos.Stepper;
import org.springframework.stereotype.Service;

@Service
public class StepperMetadataBuilder {

  public Stepper build() {
    return new Stepper();
  }
}
