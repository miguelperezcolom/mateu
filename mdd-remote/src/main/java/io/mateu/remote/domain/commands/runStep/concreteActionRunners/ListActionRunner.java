package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.core.interfaces.Crud;

import java.util.Map;

public interface ListActionRunner {

    boolean applies(Crud crud, String actionId);

    void run(Crud crud, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable;

}
