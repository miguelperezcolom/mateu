package io.mateu.remote.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Action {

  private String id;

  private String caption;

  private ActionType type;

  private boolean visible;

  private boolean validationRequired;

  private boolean confirmationRequired;

  private boolean rowsSelectedRequired;

  private ConfirmationTexts confirmationTexts;

  private ActionTarget target;

  private String modalStyle;

  private String customEvent;

  private String href;

}
