package io.mateu.core.domain.act;

import static io.mateu.core.application.runaction.ComponentStateHelper.getState;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper.createActions;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FutureComponentMapper.createComponent;
import static io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper.createRules;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.createTriggers;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.createValidations;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.ServerSideComponent;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.List;
import java.util.UUID;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

@Named
public class AuditActionRunner implements ActionRunner {

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return instance instanceof Auditable && "history".equals(actionId);
  }

  @Override
  public int priority() {
    return 50;
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var listing = new AuditHistoryListing((Auditable) instance);
    var httpRequest = command.httpRequest();

    var clientSide =
        createComponent(
            listing,
            command.baseUrl(),
            command.route(),
            command.consumedRoute(),
            command.initiatorComponentId(),
            httpRequest);

    var serverSide =
        ServerSideComponent.builder()
            .id(
                httpRequest.getAttribute("upstreamComponentId") != null
                    ? httpRequest.getAttribute("upstreamComponentId").toString()
                    : UUID.randomUUID().toString())
            .serverSideType(listing.getClass().getName())
            .route(command.consumedRoute())
            .initialData(getState(listing, httpRequest))
            .style("width: 100%;")
            .cssClasses("")
            .actions(createActions(listing, httpRequest))
            .triggers(createTriggers(listing, httpRequest))
            .rules(createRules(listing, httpRequest))
            .validations(createValidations(listing, command.route()))
            .children(List.of(clientSide))
            .build();

    return Flux.just(
        Dialog.builder()
            .headerTitle("History")
            .width("80vw")
            .height("70vh")
            .resizable(true)
            .content(serverSide)
            .build());
  }
}
