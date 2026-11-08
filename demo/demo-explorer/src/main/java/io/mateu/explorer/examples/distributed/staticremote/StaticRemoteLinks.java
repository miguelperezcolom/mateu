package io.mateu.explorer.examples.distributed.staticremote;

import static io.mateu.explorer.examples.distributed.Links.column;
import static io.mateu.explorer.examples.distributed.Links.open;
import static io.mateu.explorer.examples.distributed.Links.row;
import static io.mateu.explorer.examples.distributed.Links.text;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/** The static Help Center as a section of the federated console. */
public class StaticRemoteLinks implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        text(
            "In the console, open Help Center: the browser reads the bundle's manifest.json and answers"
                + " every load of the section from it — no request reaches any server but the file host.")
            ,
        row(open("/fed/help/faq", "/fed/help/faq"), open("/fed/help/contact", "/fed/help/contact")));
  }
}
