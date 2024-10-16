package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.ActionPosition;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionType;
import io.mateu.core.domain.uidefinition.shared.annotations.Ignored;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WizardPage2 {

  @Ignored private WizardPage1 wizardPage1;

  String job;

  public WizardPage2(WizardPage1 wizardPage1) {
    this.wizardPage1 = wizardPage1;
  }

  public WizardPage2() {}

  @MainAction
  public WizardPage3 goToNextPage() {
    return new WizardPage3(this);
  }

  @MainAction(type = ActionType.Tertiary, position = ActionPosition.Left)
  public WizardPage1 back() {
    return wizardPage1;
  }

}
