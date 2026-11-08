package io.mateu.explorer.examples.components.notification;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Notification;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * A {@link Notification} is a toast returned from an action: a title and a text. For toasts with a
 * severity, a duration or an Undo button, return a {@link Message} instead (both are shown).
 */
public class NotificationExamples implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return HorizontalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                Button.builder().label("Notify").actionId("notifyMe").build(),
                Button.builder().label("A Message, for comparison").actionId("messageMe").build()))
        .build();
  }

  public Notification notifyMe() {
    return new Notification("Catalogue exported", "1,284 records were written to catalogue.csv.");
  }

  public Message messageMe() {
    return Message.success("A Message has a severity — success, warning, error…");
  }
}
