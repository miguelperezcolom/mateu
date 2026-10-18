package io.mateu.sample1.chat;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.HttpRequest;

/** A page that takes render-screen itself: the shell must leave the event to it. */
@Title("Subscribed chat page")
@ReadOnly
@SubscribeTo(event = "render-screen", action = "renderScreen")
public class ChatLabSubscribedPage {
  public String received = "nothing yet";

  @Action
  public Object renderScreen(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    Object yaml = rq != null && rq.parameters() != null ? rq.parameters().get("yaml") : null;
    received = "The page took it: " + (yaml != null ? String.valueOf(yaml).length() : 0) + " chars";
    return this;
  }
}
