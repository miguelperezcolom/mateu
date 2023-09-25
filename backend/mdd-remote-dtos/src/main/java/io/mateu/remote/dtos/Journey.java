package io.mateu.remote.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Journey {

  private String type;

  private JourneyStatus status;

  private String statusMessage;

  private String currentStepId;

  private String currentStepDefinitionId;
}
