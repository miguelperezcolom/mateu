package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.mdd.shared.annotations.MainAction;
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
}
