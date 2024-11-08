package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.MainAction;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WizardPage1 {

  String name;

  int age;

  @MainAction
  public WizardPage2 goToNextPage() {
    return new WizardPage2(this);
  }
}
