package io.mateu.core.domain.apiClients;

import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.remote.dtos.*;
import io.mateu.util.Serializer;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class MateuRemoteClient {

  final Serializer serializer;

  private WebClient buildClient(String remoteBaseUrl) {
    return WebClient.builder().baseUrl(remoteBaseUrl).build();
  }

  public Mono<StepWrapper> startJourney(
      String remoteBaseUrl,
      String remoteJourneyTypeId,
      String journeyId,
      ServerHttpRequest serverHttpRequest) {
    String uri = "/journeys/" + remoteJourneyTypeId + "/" + journeyId;
    return buildClient(remoteBaseUrl)
        .post()
        .uri(uri)
        .headers(headers -> serverHttpRequest.getHeaders())
        .body(Mono.just(JourneyCreationRq.builder().build()), JourneyCreationRq.class)
        .retrieve()
        .bodyToMono(StepWrapper.class);
  }

  public Mono<Journey> getJourney(
      String remoteBaseUrl,
      String remoteJourneyTypeId,
      String journeyId,
      ServerHttpRequest serverHttpRequest) {
    String uri = "/journeys/" + remoteJourneyTypeId + "/" + journeyId;
    return buildClient(remoteBaseUrl)
        .get()
        .uri(uri)
        .headers(headers -> serverHttpRequest.getHeaders())
        .retrieve()
        .bodyToMono(Journey.class);
  }

  public Mono<Step> getStep(
      String remoteBaseUrl,
      String remoteJourneyTypeId,
      String journeyId,
      String stepId,
      ServerHttpRequest serverHttpRequest) {
    String uri = "/journeys/" + remoteJourneyTypeId + "/" + journeyId + "/steps/" + stepId;
    return buildClient(remoteBaseUrl)
        .get()
        .uri(uri)
        .headers(headers -> serverHttpRequest.getHeaders())
        .retrieve()
        .bodyToMono(Step.class);
  }

  public Mono<Void> runStep(
      String remoteBaseUrl,
      String remoteJourneyTypeId,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest) {
    String uri =
        "/journeys/" + remoteJourneyTypeId + "/" + journeyId + "/steps/" + stepId + "/" + actionId;
    return buildClient(remoteBaseUrl)
        .post()
        .uri(uri)
        .headers(headers -> serverHttpRequest.getHeaders())
        .body(Mono.just(RunActionRq.builder().data(data).build()), RunActionRq.class)
        .retrieve()
        .bodyToMono(Void.class);
  }

  public Flux<Object> getListRows(
      String remoteBaseUrl,
      String remoteJourneyTypeId,
      String journeyId,
      String stepId,
      String listId,
      Object filters,
      List<SortCriteria> ordering,
      int page,
      int pageSize,
      ServerHttpRequest serverHttpRequest)
      throws ExecutionException, InterruptedException {
    String uri =
        "/journeys/"
            + remoteJourneyTypeId
            + "/"
            + journeyId
            + "/steps/"
            + stepId
            + "/lists/"
            + listId
            + "/rows";
    return buildClient(remoteBaseUrl)
        .get()
        .uri(
            uriBuilder ->
                uriBuilder
                    .path(uri)
                    .queryParam("filters", filters)
                    .queryParam("ordering", serialize(ordering))
                    .queryParam("page", page)
                    .queryParam("page_size", pageSize)
                    .build())
        .headers(headers -> serverHttpRequest.getHeaders())
        .retrieve()
        .bodyToFlux(Object.class);
  }

  private String serialize(Object object) {
    String json = "{}";
    try {
      json = serializer.toJson(object);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
  }

  public Mono<Long> getListCount(
      String remoteBaseUrl,
      String remoteJourneyTypeId,
      String journeyId,
      String stepId,
      String listId,
      Object filters,
      ServerHttpRequest serverHttpRequest)
      throws ExecutionException, InterruptedException {
    String uri =
        "/journeys/"
            + remoteJourneyTypeId
            + "/"
            + journeyId
            + "/steps/"
            + stepId
            + "/lists/"
            + listId
            + "/count";
    return buildClient(remoteBaseUrl)
        .get()
        .uri(uriBuilder -> uriBuilder.path(uri).queryParam("filters", filters).build())
        .headers(headers -> serverHttpRequest.getHeaders())
        .retrieve()
        .bodyToMono(Long.class);
  }

  public UI getUi(String remoteBaseUrl, String uiId, ServerHttpRequest serverHttpRequest)
      throws ExecutionException, InterruptedException {
    String uri = "/uis/" + uiId;
    return buildClient(remoteBaseUrl)
        .get()
        .uri(uriBuilder -> uriBuilder.path(uri).build())
        .headers(headers -> serverHttpRequest.getHeaders())
        .retrieve()
        .bodyToMono(UI.class)
        .toFuture()
        .get();
  }
}
