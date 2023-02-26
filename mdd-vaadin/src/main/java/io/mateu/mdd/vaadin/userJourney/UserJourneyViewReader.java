package io.mateu.mdd.vaadin.userJourney;

import io.mateu.mdd.core.app.MDDRunUserJourneyAction;
import io.mateu.mdd.shared.interfaces.Choice;
import io.mateu.mdd.shared.interfaces.Option;
import io.mateu.mdd.shared.interfaces.UserJourney;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class UserJourneyViewReader {

    private final UserJourney userJourney;
    private final MDDRunUserJourneyAction runUserJourneyAction;
    private final String baseUrl;

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getJourneyType() {
        return userJourney != null?userJourney.getJourneyType():null;
    }

    public UserJourneyViewReader(UserJourney userJourney) {
        this.userJourney = userJourney;
        this.runUserJourneyAction = null;
        String bu = userJourney.getBaseUrl();
        if (!bu.contains("mateu/v1/journeys/")) {
            if (!bu.endsWith("/")) {
                bu += "/";
            }
            bu += "mateu/v1/journeys/";
        }
        this.baseUrl = bu;
    }

    public UserJourneyViewReader(MDDRunUserJourneyAction runUserJourneyAction) {
        this.userJourney = null;
        this.runUserJourneyAction = runUserJourneyAction;
        String bu = runUserJourneyAction.getBaseUrl();
        if (!bu.contains("mateu/v1/journeys/")) {
            if (!bu.endsWith("/")) {
                bu += "/";
            }
            bu += "mateu/v1/journeys/";
        }
        this.baseUrl = bu;
    }

    public void complete() throws Exception {

        String u = baseUrl + runUserJourneyAction.getJourneyId() + "/steps/" +
                runUserJourneyAction.getStepId() + "/" + runUserJourneyAction.getActionId();

        log.info("complete step " + u);

        RunActionRq rq = RunActionRq.builder()
                .data(getData(runUserJourneyAction.getStepFormInstance()))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(u))
                .POST(HttpRequest.BodyPublishers.ofString(Helper.toJson(rq)))
                .setHeader("Content-Type", "application/json")
                .build();

        HttpResponse<String> response = HttpClient.newBuilder().build()
                .send(request, HttpResponse.BodyHandlers.ofString());
    }

    private Map<String, Object> getData(Object stepFormInstance) {
        Map<String, Object> data = new HashMap<>();
        for (FieldInterfaced field : ReflectionHelper.getAllEditableFields(stepFormInstance.getClass())) {
            try {
                Object value = ReflectionHelper.getValue(field, stepFormInstance);
                if (value != null) {
                    if (value instanceof Choice) {
                        Option option = ((Choice) value).getValue();
                        if (option == null) {
                            value = null;
                        } else value = option.getValue();
                    }
                }
                if (value != null) {
                    data.put(field.getId(), value);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return data;
    }

    public void createJourney(String journeyId) throws URISyntaxException, IOException, InterruptedException {

        log.info("create journey with business key " + journeyId);

        JourneyCreationRq rq = JourneyCreationRq.builder()
                .journeyTypeId(userJourney.getJourneyType())
                .contextData(List.of())
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(baseUrl + journeyId))
                .POST(HttpRequest.BodyPublishers.ofString(Helper.toJson(rq)))
                .setHeader("Content-Type", "application/json")
                .build();

        HttpResponse<String> response = HttpClient.newBuilder().build()
                .send(request, HttpResponse.BodyHandlers.ofString());

    }

    public Journey getJourney(String journeyId) throws URISyntaxException, IOException, InterruptedException {

        log.info("get journey with business key " + journeyId);

        HttpRequest request = HttpRequest.newBuilder()

                .uri(new URI(baseUrl + journeyId))
                .GET()
                .build();

        HttpResponse<String> response = HttpClient.newBuilder().build()
                .send(request, HttpResponse.BodyHandlers.ofString());

        Journey journey = Helper.fromJson(response.body(), Journey.class);

        return journey;
    }


    public Step getStep(String journeyId, String stepId) throws URISyntaxException, IOException, InterruptedException {

        HttpRequest request = HttpRequest.newBuilder()

                .uri(new URI(baseUrl + journeyId + "/steps/" + stepId))
                .GET()
                .build();

        HttpResponse<String> response = HttpClient.newBuilder().build()
                .send(request, HttpResponse.BodyHandlers.ofString());

        Step step = Helper.fromJson(response.body(), Step.class);

        return step;
    }

}
