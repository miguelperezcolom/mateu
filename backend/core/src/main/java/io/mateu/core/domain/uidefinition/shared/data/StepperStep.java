package io.mateu.core.domain.uidefinition.shared.data;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class StepperStep {

  private String id;

  private String caption;

  private String description;

  private boolean done;

  private boolean current;
}
