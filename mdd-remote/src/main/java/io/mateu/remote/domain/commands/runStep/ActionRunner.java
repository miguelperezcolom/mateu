package io.mateu.remote.domain.commands.runStep;

import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.Map;

public interface ActionRunner {

    boolean applies(Object viewInstance, String actionId);

    void run(Object viewInstance, String journeyId, String stepId, String actionId
            , Map<String, Object> data, ServerHttpRequest serverHttpRequest) throws Throwable;
}
