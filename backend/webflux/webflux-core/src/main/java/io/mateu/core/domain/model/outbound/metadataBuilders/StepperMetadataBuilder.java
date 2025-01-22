package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.dtos.StepperDto;
import org.springframework.stereotype.Service;

@Service
public class StepperMetadataBuilder {

  public StepperDto build() {
    return new StepperDto();
  }
}
