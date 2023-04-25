package io.mateu.remote.domain.commands.runStep;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.File;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.*;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.MateuRemoteClient;
import io.mateu.remote.domain.commands.EntityEditorFactory;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.files.StorageServiceAccessor;
import io.mateu.remote.domain.persistence.Merger;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import jakarta.persistence.Entity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import javax.naming.AuthenticationException;
import java.io.IOException;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RunStepActionCommandHandler {

    @Autowired
    JourneyStoreService store;

    @Autowired
    MateuRemoteClient mateuRemoteClient;

    @Autowired
    List<ActionRunner>  actionRunners;

    @Autowired
    ActualValueExtractor actualValueExtractor;

    @Transactional
    public Mono<Void> handle(RunStepActionCommand command) throws Throwable {

        String journeyId = command.getJourneyId();
        String stepId = command.getStepId();
        String actionId = command.getActionId();
        Map<String, Object> data = command.getData();

        JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);

        if (journeyContainer == null) {
            throw new Exception("No journey with id " + journeyId);
        }

        if (!Strings.isNullOrEmpty(journeyContainer.getRemoteJourneyTypeId())) {
            return mateuRemoteClient.runStep(journeyContainer.getRemoteBaseUrl(),
                    journeyContainer.getRemoteJourneyTypeId(), journeyContainer.getJourneyId(),
                    stepId, actionId, data);
        }

        Object viewInstance = store.getViewInstance(journeyId, stepId);

        if (viewInstance instanceof FieldEditor) {
            // no need to fill the fieldEditor
        } else if (viewInstance instanceof EntityEditor) {
            // no need to fill the entityEditor
        } else {
            data.entrySet().forEach(entry -> {
                try {
                    Object actualValue = actualValueExtractor.getActualValue(entry, viewInstance);
                    ReflectionHelper.setValue(entry.getKey(), viewInstance, actualValue);
                } catch (Exception ex) {
                    System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                }
            });
        }

        store.getStep(journeyId, stepId).setData(data);

        //todo: look for the target object
        String componentId = "component-0";
        if (actionId.contains("___")) {
            componentId = actionId.substring(0, actionId.indexOf("___"));
            actionId = actionId.substring(actionId.indexOf("___") + "___".length());
        }

        if (!"component-0".equals(componentId)) {

        }

        boolean actionRunnerFound = false;
        for (ActionRunner actionRunner : actionRunners) {
            if (actionRunner.applies(viewInstance, actionId)) {
                actionRunnerFound = true;
                actionRunner.run(viewInstance, journeyId, stepId, actionId, data);
                break;
            }
        }

        if (!actionRunnerFound) {
            throw new Exception("Unkonwn action " + actionId);
        }

        return Mono.empty();
    }

}
