package io.mateu.explorer.examples.distributed.console;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;

/** The console's only local page: everything else in its menu belongs to other deployments. */
@Title("Welcome to the federated console")
public class ConsoleWelcome {

  @ReadOnly
  String whatIsHere =
      "Inventory (a Java app), Orders (a YAML-only app) and the Help Center (a static bundle) are"
          + " three other deployments. Their menus are fetched at run time and merged here.";
}
