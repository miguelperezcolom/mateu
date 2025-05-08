package com.example.uis.forms;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionType;
import io.mateu.uidl.interfaces.Form;

public class SimpleForm implements Form {

  String stringField;

  int intField;

  @Action(type = ActionType.Main)
  void simpleAction() {}
}
