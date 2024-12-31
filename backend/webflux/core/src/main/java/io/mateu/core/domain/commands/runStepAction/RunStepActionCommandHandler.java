package io.mateu.core.domain.commands.runStepAction;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ResultMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.dtos.*;
import io.mateu.uidl.interfaces.ActionHandler;
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
  final ReflectionService reflectionService;
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
              reflectionService.newInstance(
                  ServerSideObject.class, (Map<String, Object>) data.get("__actionHandler"));
      ActionHandler actionHandler =
          (ActionHandler)
              reflectionService.newInstance(
                  Class.forName(serverSideObject.className()), serverSideObject.data());
      var method = reflectionService.getMethod(actionHandler.getClass(), "handle");
      return resultMapper.processResult(
          actionHandler,
          method,
          method,
          data,
          command.baseUrl(),
          serverHttpRequest,
          actionHandler.handle(serverSideObject, actionId, serverHttpRequest),
          componentId,
          false);
    }

    Object viewInstance =
        reflectionService.newInstance(Class.forName(command.componentType()), data);

    for (ActionRunner actionRunner : actionRunners) {
      if (actionRunner.applies(viewInstance, actionId, command.contextData())) {
        return actionRunner.run(
            viewInstance,
            stepId,
            actionId,
            componentId,
            data,
            command.contextData(),
            command.baseUrl(),
            serverHttpRequest);
      }
    }

    throw new Exception("Unknown action " + actionId);
  }
}
