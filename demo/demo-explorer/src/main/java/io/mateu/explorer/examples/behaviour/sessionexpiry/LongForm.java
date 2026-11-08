package io.mateu.explorer.examples.behaviour.sessionexpiry;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * Type something, "expire" the session, press Save: the server answers 401, the app's handler
 * (handler.js, loaded by the Element below) re-authenticates and the SAME request is retried — the
 * form keeps what you typed and the save completes.
 */
public class LongForm implements ComponentTreeSupplier {

  String notes;

  @Override
  public Component component(HttpRequest httpRequest) {
    return Form.builder()
        .title("Twenty minutes of typing")
        .content(
            List.of(
                // the app's re-auth flow: a JS module registering the `mateu-session-expired` handler
                new Element(
                    "demo-session-handler",
                    Map.of("import", "/explorer-assets/session-expiry/handler.js"),
                    ""),
                new Text("Token in use: " + DemoTokenGuard.tokenOf(httpRequest)),
                FormField.builder().id("notes").label("Notes").dataType(FieldDataType.string).build(),
                Button.builder().label("1. Expire my session").actionId("expireSession").build(),
                Button.builder().label("2. Save").actionId("save").build()))
        .build();
  }

  public Message expireSession(HttpRequest httpRequest) {
    DemoTokenGuard.revoke(DemoTokenGuard.tokenOf(httpRequest));
    return Message.warning("Session expired on the server. Now press Save.");
  }

  public Message save() {
    return Message.success("Saved: " + notes);
  }
}
