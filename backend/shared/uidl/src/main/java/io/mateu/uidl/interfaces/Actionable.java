package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Component;

public interface Actionable {

  boolean selected();

  String path();

  String label();

  Component component();

  String className();

  boolean disabled();

  boolean disabledOnClick();

  Object itemData();
}
