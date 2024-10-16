package io.mateu.core.domain.commands.runStepAction;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ResultMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.interfaces.ActionHandler;
import io.mateu.dtos.*;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class RunStepActionCommandHandler {

  final List<ActionRunner> actionRunners;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final ViewMapper viewMapper;
  private final ResultMapper resultMapper;

  @Transactional
  public Mono<UIIncrement> handle(RunStepActionCommand command) throws Throwable {
    String stepId = command.stepId();
    String actionId = command.actionId();
    String componentId = command.componentId();
    Map<String, Object> data = command.data();
    ServerHttpRequest serverHttpRequest = command.serverHttpRequest();

    if (data.containsKey("__actionHandler")) {
      ServerSideObject serverSideObject =
          (ServerSideObject)
              reflectionHelper.newInstance(
                  ServerSideObject.class, (Map<String, Object>) data.get("__actionHandler"));
      ActionHandler actionHandler =
          (ActionHandler)
              reflectionHelper.newInstance(
                  Class.forName(serverSideObject.className()), serverSideObject.data());
      return resultMapper.processResult(
          actionHandler,
          reflectionHelper.getMethod(actionHandler.getClass(), "handle"),
          data,
          serverHttpRequest,
          actionHandler.handle(actionId),
          componentId);
    }

    Object viewInstance =
        reflectionHelper.newInstance(Class.forName(command.componentType()), data);

    for (ActionRunner actionRunner : actionRunners) {
      if (actionRunner.applies(viewInstance, actionId, command.contextData())) {
        return actionRunner.run(
            viewInstance,
            stepId,
            actionId,
            componentId,
            data,
            command.contextData(),
            serverHttpRequest);
      }
    }

    throw new Exception("Unknown action " + actionId);
  }
}
