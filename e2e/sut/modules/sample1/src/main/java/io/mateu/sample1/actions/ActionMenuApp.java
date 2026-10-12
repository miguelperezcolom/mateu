package io.mateu.sample1.actions;

import io.mateu.sample1.Section1;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;

/**
 * A menu whose leaf RUNS an action instead of navigating (a rule leaf): clicking "Ping server"
 * runs {@link #pingServer()} on the app and shows its toast; the page under it stays.
 */
@UI("/action-menu-app")
@Title("Action menu app")
public class ActionMenuApp {

  @Menu Section1 home;

  @Menu
  Rule pingServer = Rule.builder().action(RuleAction.RunAction).actionId("pingServer").build();

  public Message pingServer() {
    return new Message("Pong from the menu");
  }
}
