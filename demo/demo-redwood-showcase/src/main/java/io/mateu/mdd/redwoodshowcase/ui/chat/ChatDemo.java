package io.mateu.mdd.redwoodshowcase.ui.chat;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chat;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The {@link Chat} component inline on a page — the fixture for the Redwood renderer's Spectra chat
 * pieces (oj-sp-chat-message-block + oj-sp-chat-input). Its agent endpoint ({@code
 * /chat-demo/agent}) is not served by this app: the browser probes answer it themselves (a mocked
 * SSE stream), so the page needs no AI backend.
 */
@UI("/chat-demo")
@Title("Assistant")
public class ChatDemo implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .content(
            List.of(
                new Text("Ask the front desk assistant about tonight's availability."),
                new Chat("/chat-demo/agent", "/chat-demo/upload")))
        .fullWidth(true)
        .build();
  }
}
