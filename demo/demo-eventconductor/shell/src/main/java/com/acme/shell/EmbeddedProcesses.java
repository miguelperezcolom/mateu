package com.acme.shell;

import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The console embedded as a remote ISLAND inside one of the shell's own pages, rather than as a
 * menu section: the browser loads {@code /workflow/processes} from the console and renders it in
 * place. Same transport, same CORS and token rules as the RemoteMenu section.
 *
 * <p>Unlike a RemoteMenu (whose descriptor names the remote's app), an island has to say which app
 * of the remote its route belongs to: {@code serverSideType} = the remote's {@code @UI} class.
 */
public class EmbeddedProcesses implements ComponentTreeSupplier {

  @Override
  public Form component(HttpRequest httpRequest) {
    return Form.builder()
        .title("Running processes")
        .content(
            List.of(
                MicroFrontend.builder()
                    .baseUrl(Shell.consoleUrl() + "/_workflow")
                    .route("/workflow/processes")
                    .consumedRoute("")
                    // the console's screens are routes of ITS app (they live in its menu): name
                    // the app, or the console answers "Page not found" for a bare screen request
                    .serverSideType("io.mateu.workflow.infra.in.ui.WorkflowHome")
                    .build()))
        .build();
  }
}
