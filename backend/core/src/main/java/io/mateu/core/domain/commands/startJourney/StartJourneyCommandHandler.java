package io.mateu.core.domain.commands.startJourney;

import io.mateu.core.application.NotFoundException;
import io.mateu.core.domain.apiClients.MateuRemoteClient;
import io.mateu.core.domain.model.modelToDtoMappers.JourneyMapper;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.interfaces.RemoteJourney;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class StartJourneyCommandHandler {

  @Autowired MateuRemoteClient mateuRemoteClient;
  @Autowired JourneyStoreService store;

  public Mono<Void> handle(StartJourneyCommand command) throws Throwable {

    // listar todas las matu uis

    String journeyId = command.getJourneyId();
    String journeyTypeId = command.getJourneyTypeId();
    ServerHttpRequest serverHttpRequest = command.getServerHttpRequest();

    Journey journey = null;
    Object formInstance = null;

    JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);
    if (journeyContainer == null) {

      try {

        formInstance = store.createInstanceFromJourneyTypeId(journeyTypeId, serverHttpRequest);

        if (formInstance == null) {
          throw new Exception();
        }

        // we are passing the form instance to avoid creating a new form instance,
        // even though we already have the step definition id, and we could recreate it
        journey = new JourneyMapper().map(formInstance);

        if (formInstance instanceof RemoteJourney) {
          RemoteJourney remoteJourney = (RemoteJourney) formInstance;
          Journey finalJourney = journey;
          log.info("it's a remote journey " + journeyTypeId + "/" + journeyId);
          return mateuRemoteClient.startJourney(
              remoteJourney.getBaseUrl(),
              remoteJourney.getJourneyTypeId(),
              journeyId,
              serverHttpRequest)
                  .doOnError(e -> System.out.println("error!!!!" + e))
            .flatMap(sw -> {
                var step = sw.getStep();
                finalJourney.setCurrentStepId(step.getId());
                finalJourney.setCurrentStepDefinitionId(step.getType());
                store(
                        journeyId,
                        journeyTypeId,
                        finalJourney,
                        step,
                        remoteJourney.getBaseUrl(),
                        remoteJourney.getJourneyTypeId());
                return Mono.just(sw);
          }).log().then();
        }

      } catch (Exception e) {
        e.printStackTrace();
        log.error("error on getUi", e);
        throw new NotFoundException("No class with name " + journeyTypeId + " found");
      }

      Step step =
          store
              .getStepMapper()
              .map(
                  journeyContainer, getStepId(formInstance), null, formInstance, serverHttpRequest);
      journey.setCurrentStepId(step.getId());
      journey.setCurrentStepDefinitionId(step.getType());
      store(journeyId, journeyTypeId, journey, step);

    } else {
      journeyContainer.reset();
    }

    return Mono.empty().then();
  }

  private String getStepId(Object formInstance) {
    if (formInstance instanceof Listing) return "list";
    return "form";
  }

  private void store(String journeyId, String journeyTypeId, Journey journey, Step step) {
    JourneyContainer journeyContainer =
        JourneyContainer.builder()
            .journeyId(journeyId)
            .journeyTypeId(journeyTypeId)
            .journey(journey)
            .steps(Map.of(step.getId(), step))
            .initialStep(step)
            .lastUsedFilters(new HashMap<>())
            .lastUsedSorting(new HashMap<>())
            .build();
    store.save(journeyContainer);
  }

  private void store(
      String journeyId,
      String journeyTypeId,
      Journey journey,
      Step step,
      String remoteBaseUrl,
      String remoteJourneyTypeId) {
    JourneyContainer journeyContainer =
        JourneyContainer.builder()
            .journeyId(journeyId)
            .journeyTypeId(journeyTypeId)
            .journey(journey)
                .steps(Map.of(step.getId(), step))
                .initialStep(step)
            .lastUsedFilters(new HashMap<>())
            .lastUsedSorting(new HashMap<>())
            .remoteBaseUrl(remoteBaseUrl)
            .remoteJourneyTypeId(remoteJourneyTypeId)
            .build();
    store.save(journeyContainer);
  }
}
