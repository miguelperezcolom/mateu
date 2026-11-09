package io.mateu.explorer.examples.behaviour.appcontext;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** A screen that reads the app context ON THE SERVER, on every request. */
public class BookingsToday implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Form.builder()
        .title("Bookings today")
        .content(
            List.of(
                new Text("Hotel: " + text(httpRequest.appContext("hotel"), "(none picked)")),
                new Text("Year: " + text(httpRequest.appContext("fiscalYear"), "(none picked)")),
                Button.builder().label("Ask the server").actionId("whichContext").build()))
        .build();
  }

  public Message whichContext(HttpRequest httpRequest) {
    return new Message(
        "The server received hotel="
            + httpRequest.appContext("hotel")
            + ", year="
            + httpRequest.appContext("fiscalYear"));
  }

  private static String text(Object value, String fallback) {
    return value == null ? fallback : value.toString();
  }
}
