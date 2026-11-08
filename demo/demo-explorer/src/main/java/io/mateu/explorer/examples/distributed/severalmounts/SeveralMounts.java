package io.mateu.explorer.examples.distributed.severalmounts;

import static io.mateu.explorer.examples.distributed.Links.boxed;
import static io.mateu.explorer.examples.distributed.Links.caption;
import static io.mateu.explorer.examples.distributed.Links.column;
import static io.mateu.explorer.examples.distributed.Links.open;
import static io.mateu.explorer.examples.distributed.Links.row;

import io.mateu.explorer.examples.distributed.console.FederatedConsole;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * This one Spring Boot app serves THREE mounts: the Explorer itself ({@code @UI("")}), the
 * federated console ({@code @UI("/fed")}, Java) and a YAML mount ({@code type: UI}, basePath
 * {@code /yaml-mount}). Both of the last two have a {@code welcome} route: routes are relative to
 * their mount, so they never clash. Below, each mount's {@code welcome}, embedded.
 */
public class SeveralMounts implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        row(
            open("The Explorer — /", "/"),
            open("Java mount — /fed", "/fed"),
            open("YAML mount — /yaml-mount", "/yaml-mount")),
        caption("/yaml-mount → route welcome (YAML)"),
        boxed(
            MicroFrontend.builder().baseUrl("/yaml-mount").route("/welcome").consumedRoute("").build()),
        caption("/fed → route welcome (Java)"),
        boxed(
            MicroFrontend.builder()
                .baseUrl("/fed")
                .route("/welcome")
                .consumedRoute("")
                .serverSideType(FederatedConsole.class.getName())
                .build()));
  }
}
