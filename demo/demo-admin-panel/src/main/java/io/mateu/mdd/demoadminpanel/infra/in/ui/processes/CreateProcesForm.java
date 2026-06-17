package io.mateu.mdd.demoadminpanel.infra.in.ui.processes;

import io.mateu.mdd.demoadminpanel.infra.in.ui.Home2;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.*;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreateProcesForm {

    final ProcessRepository repository;

    String name;

    @Toolbar
    Object create(HttpRequest httpRequest) {
        var id = UUID.randomUUID().toString();
        repository.save(new ProcessRow(id, name));
        return UICommand.builder()
                .type(UICommandType.DispatchEvent)
                .data(new DispatchEventData(
                        "navigation-requested",
                        NavigationRequestedPayload.builder()
                                .route("/workflow/processes/" + id)
                                .consumedRoute("/workflow/processes/")
                                .baseUrl(httpRequest.getBaseUrl())
                                .uriPrefix("")
                                .serverSideType(Processes.class.getName())
                                .build()
                ))
                .build();
    }

}
