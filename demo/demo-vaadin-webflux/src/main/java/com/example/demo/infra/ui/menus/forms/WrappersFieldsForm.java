package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ReadOnly;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WrappersFieldsForm {

  String name;

  Integer age;

  Double rating;

  Boolean citizen;

  @ReadOnly String assessment;

  @Action
  public void assess() {
    assessment = "" + name + ", " + age + ", " + rating + ", " + citizen;
  }
}
