package io.mateu.explorer.examples.components.button;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalTime;
import java.util.List;

/**
 * The same buttons in Java, as a fluent component tree. A fluent button may carry its own handler
 * (a {@code Callable} or a {@code Runnable}): Mateu runs it when the button is pressed — no
 * {@code @Action} method needed. Whatever the handler returns is the answer (here a toast). Give
 * each one an explicit {@code actionId}: as of 3.0-beta.51 a handler button without one is not
 * advertised, so the browser never sends its click.
 */
public class FluentButtons implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return HorizontalLayout.builder()
        .spacing(true)
        .wrap(true)
        .content(
            List.of(
                Button.builder()
                    .label("Say hello")
                    .actionId("sayHello")
                    .buttonStyle(ButtonStyle.primary)
                    .callable(() -> Message.success("Hello! It is " + LocalTime.now().withNano(0)))
                    .build(),
                Button.builder()
                    .label("Warn me")
                    .actionId("warnMe")
                    .color(ButtonColor.warning)
                    .callable(() -> Message.warning("This is a warning toast"))
                    .build(),
                Button.builder()
                    .label("Fail")
                    .actionId("fail")
                    .color(ButtonColor.error)
                    .callable(() -> Message.error("Errors stay until you close them"))
                    .build()))
        .build();
  }
}
