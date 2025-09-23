package com.example.uis.forms;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionType;
import io.mateu.uidl.interfaces.Page;

public class SimpleForm implements Page {

  String stringField;

  int intField;

  boolean booleanField;

  @Action(type = ActionType.Main)
  void simpleAction() {}
}
