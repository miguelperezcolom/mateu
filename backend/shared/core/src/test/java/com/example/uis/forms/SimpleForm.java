package com.example.uis.forms;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.interfaces.Page;

public class SimpleForm implements Page {

  String stringField;

  int intField;

  boolean booleanField;

  @Button
  void simpleAction() {}
}
