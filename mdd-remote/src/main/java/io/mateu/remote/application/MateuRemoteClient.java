package io.mateu.remote.application;

import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.remote.domain.mappers.ViewMapper;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class MateuRemoteClient {

    private WebClient buildClient(String remoteBaseUrl) {
        return WebClient.builder()
                .baseUrl(remoteBaseUrl)
                .build();
    }

    public Mono<Void> startJourney(String remoteBaseUrl, String remoteJourneyTypeId, String journeyId) {
        String uri = "/journeys/" + remoteJourneyTypeId + "/" + journeyId;
        return buildClient(remoteBaseUrl).post().uri(uri)
                .body(Mono.just(JourneyCreationRq.builder().build()), JourneyCreationRq.class)
                .retrieve().bodyToMono(Void.class);
    }

    public Mono<Journey> getJourney(String remoteBaseUrl, String remoteJourneyTypeId, String journeyId) {
        String uri = "/journeys/" + remoteJourneyTypeId + "/" + journeyId;
        return buildClient(remoteBaseUrl).get().uri(uri).retrieve().bodyToMono(Journey.class);
    }

    public Mono<Step> getStep(String remoteBaseUrl, String remoteJourneyTypeId, String journeyId, String stepId) {
        String uri = "/journeys/" + remoteJourneyTypeId + "/" + journeyId + "/steps/" + stepId;
        return buildClient(remoteBaseUrl).get().uri(uri).retrieve().bodyToMono(Step.class);
    }

    public Mono<Void> runStep(String remoteBaseUrl, String remoteJourneyTypeId, String journeyId,
                        String stepId, String actionId, Map<String, Object> data) {
        String uri = "/journeys/" + remoteJourneyTypeId + "/" + journeyId + "/steps/" + stepId + "/" + actionId;
        return buildClient(remoteBaseUrl).post().uri(uri)
                .body(Mono.just(RunActionRq.builder()
                                .data(data)
                        .build()), RunActionRq.class)
                .retrieve().bodyToMono(Void.class);
    }

    public List<Object> getListRows(String remoteBaseUrl, String remoteJourneyTypeId, String journeyId, String stepId,
                                    String listId, Object filters, List<SortCriteria> ordering, int page, int pageSize) throws ExecutionException, InterruptedException {
        String uri = "/journeys/" + remoteJourneyTypeId + "/" + journeyId + "/steps/" + stepId + "/lists/" + listId + "/rows";
        return buildClient(remoteBaseUrl).get().uri(uriBuilder -> uriBuilder
                        .path(uri)
                        .queryParam("filters", filters)
                        .queryParam("ordering", serialize(ordering))
                        .queryParam("page", page)
                        .queryParam("page_size", pageSize)
                        .build())
                .retrieve().bodyToMono(List.class).toFuture().get();
    }

    private String serialize(Object object) {
        String json = "{}";
        try {
            json = Helper.toJson(object);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    public long getListCount(String remoteBaseUrl, String remoteJourneyTypeId, String journeyId, String stepId,
                             String listId, Object filters) throws ExecutionException, InterruptedException {
        String uri = "/journeys/" + remoteJourneyTypeId + "/" + journeyId + "/steps/" + stepId + "/lists/" + listId + "/count";
        return buildClient(remoteBaseUrl).get().uri(uriBuilder -> uriBuilder
                        .path(uri)
                        .queryParam("filters", filters)
                        .build())
                .retrieve().bodyToMono(Long.class).toFuture().get();
    }

    public UI getUi(String remoteBaseUrl, String uiId) throws ExecutionException, InterruptedException {
        String uri = "/uis/" + uiId;
        return buildClient(remoteBaseUrl).get().uri(uriBuilder -> uriBuilder
                        .path(uri)
                        .build())
                .retrieve().bodyToMono(UI.class).toFuture().get();
    }
}
