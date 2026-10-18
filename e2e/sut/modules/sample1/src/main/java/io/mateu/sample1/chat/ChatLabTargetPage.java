package io.mateu.sample1.chat;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;

/** Where the agent's navigation-requested goes. */
@Title("Chat target page")
@ReadOnly
public class ChatLabTargetPage {
  public String note = "Arrived by the agent";
}
