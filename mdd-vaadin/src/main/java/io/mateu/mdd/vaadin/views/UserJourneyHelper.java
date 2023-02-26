package io.mateu.mdd.vaadin.views;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.MDDRunUserJourneyAction;
import io.mateu.mdd.shared.interfaces.Option;
import io.mateu.mdd.shared.interfaces.UserJourney;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.pojos.Result;
import io.mateu.mdd.vaadin.userJourney.UserJourneyViewReader;
import io.mateu.reflection.FieldInterfacedFromRemoteField;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.InvocationTargetException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class UserJourneyHelper {

    public static Object completeStep(MDDRunUserJourneyAction runUserJourneyAction) throws Exception {

        if (ReflectionHelper.getValue("_journeyId", runUserJourneyAction.getStepFormInstance()) == null) {
            String journeyId = UUID.randomUUID().toString();
            log.info("resetting journeyId to " + journeyId);

            UserJourneyViewReader reader = new UserJourneyViewReader(new UserJourney(runUserJourneyAction.getBaseUrl(),
                    (String) ReflectionHelper.getValue("_journeyTypeId", runUserJourneyAction.getStepFormInstance())));
            reader.createJourney(journeyId);
            Journey journey = reader.getJourney(journeyId);

            runUserJourneyAction.setJourneyId(journeyId);
            runUserJourneyAction.setStepId(journey.getCurrentStepId());
        }
        UserJourneyViewReader reader = new UserJourneyViewReader(runUserJourneyAction);

        reader.complete();

        resetJourneyStep(runUserJourneyAction.getStepFormInstance());

        return createBean(reader, runUserJourneyAction.getJourneyId());
    }

    public static List<Option> getProcessTypes(String baseUrl) throws Exception {
        String u = baseUrl + "/mateu/v1/journey-types";

        log.info("get journey types " + u);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(u))
                .GET()
                .build();

        HttpResponse<String> response = HttpClient.newBuilder().build()
                .send(request, HttpResponse.BodyHandlers.ofString());

        JourneyType[] types = Helper.fromJson(response.body(), JourneyType[].class);
        return Arrays.asList(types).stream().map(t -> new Option(t.getName(), t.getId())).collect(Collectors.toList());
    }

    private static void resetJourneyStep(Object form) throws Exception {
        ReflectionHelper.setValue("_journeyId", form, null);
    }

    public static Object createBean(UserJourney userJourney) throws Exception {
        UserJourneyViewReader reader = new UserJourneyViewReader(userJourney);

        String journeyId = UUID.randomUUID().toString();

        reader.createJourney(journeyId);

        return createBean(reader, journeyId);
    }

    public static Object createBean(UserJourneyViewReader reader, String journeyId) throws Exception {

        Journey journey = reader.getJourney(journeyId);

        if (JourneyStatus.Finished.equals(journey.getStatus())) {
            return new Result("Journey is already finished");
        }

        if (journey.getCurrentStepId() == null) {
            return new Result("No step to show");
        }

        Step step = reader.getStep(journeyId, journey.getCurrentStepId());

        String targetClassName = getTargetClassName(reader.getBaseUrl(), journey.getType(), journey.getCurrentStepDefinitionId());


        Object instance = null;
        try {

            List<FieldInterfaced> fields = getFields(step.getView());

            Class type = ReflectionHelper.createClass(
                    MDD.getClassPool(),
                    MDDBinder.class,
                    MDD.getClassPool().getClassLoader(),
                    targetClassName,
                    step.getName(),
                    reader.getBaseUrl(),
                    journeyId,
                    journey.getCurrentStepId(),
                    getActions(step.getView()),
                    fields, false);

            instance = ReflectionHelper.newInstance(type);

            ReflectionHelper.setValue("_baseUrl", instance, reader.getBaseUrl());
            ReflectionHelper.setValue("_journeyId", instance, journeyId);
            ReflectionHelper.setValue("_stepId", instance, journey.getCurrentStepId());
            ReflectionHelper.setValue("_journeyTypeId", instance, journey.getType());

            for (FieldInterfaced field : fields) {
                if (field instanceof FieldInterfacedFromRemoteField) {
                    FieldInterfacedFromRemoteField rfield = (FieldInterfacedFromRemoteField) field;
                    if (rfield.getChoice() != null) {
                        ReflectionHelper.setValue(field, instance, rfield.getChoice());
                    }
                }
            }

            setValues(instance, step.getView());

        } catch (Exception e) {
            e.printStackTrace();
            Notifier.alert(e);
        }


        return instance;
    }

    private static List<Action> getActions(View view) {
        List<Action> actions = new ArrayList<>();
        for (Component component : view.getComponents()) {
            if (component.getMetadata() instanceof Form) {
                Form form = (Form) component.getMetadata();
                actions.addAll(form.getMainActions());
            }
        }
        return actions;
    }

    private static void setValues(Object instance, View view) {
        for (Component component : view.getComponents()) {
            Map<String, Object> data = component.getData();
            if (data != null) {
                for (String key : component.getData().keySet()) {
                    try {
                        ReflectionHelper.setValue(key, instance, data.get(key));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    private static List<FieldInterfaced> getFields(View view) {
        List<FieldInterfaced> fields = new ArrayList<>();
        for (Component component : view.getComponents()) {
            if (component.getMetadata() instanceof Form) {
                Form form = (Form) component.getMetadata();
                for (Section section : form.getSections()) {
                    for (FieldGroup fieldGroup : section.getFieldGroups()) {
                        for (Field field : fieldGroup.getFields()) {
                            fields.add(new FieldInterfacedFromRemoteField(field));
                        }
                    }
                }
            }
        }
        return fields;
    }

    private static String getTargetClassName(String baseUrl, String journeyType, String stepDefinitionId) {
        return "" + normalize(baseUrl)
                + "_" + normalize(journeyType) + "_UserJourney_" + normalize(stepDefinitionId);
    }

    private static String normalize(String url) {
        return Helper.capitalize(url.replaceAll("\\:", "_").replaceAll("\\/", "_").replaceAll("\\.", "_"));
    }
}
