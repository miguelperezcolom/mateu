package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.ActionPosition;
import io.mateu.uidl.annotations.ActionType;
import io.mateu.uidl.annotations.Ignored;
import io.mateu.uidl.annotations.MainAction;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class WizardPage3 {

  @Ignored WizardPage2 wizardPage2;

  LocalDate birthDate;

  public WizardPage3(WizardPage2 wizardPage2) {
    this.wizardPage2 = wizardPage2;
  }

  public WizardPage3() {}

  @MainAction
  public String end() {
    return ""
        + birthDate
        + ", "
        + wizardPage2.getJob()
        + ", "
        + wizardPage2.getWizardPage1().getName()
        + ", "
        + wizardPage2.getWizardPage1().getAge();
  }

  @MainAction(type = ActionType.Tertiary, position = ActionPosition.Left)
  public WizardPage2 back() {
    return wizardPage2;
  }
}
