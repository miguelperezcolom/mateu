package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.startJourney.StartJourneyCommandHandler;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.MenuResolver;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.interfaces.Directory;
import io.mateu.dtos.UIIncrement;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class DirectoryActionRunner extends AbstractActionRunner implements ActionRunner {

  private final MenuResolver menuResolver;
  private final ResultMapper resultMapper;
  private final ReflectionHelper reflectionHelper;
  private final StartJourneyCommandHandler startJourneyCommandHandler;

  public DirectoryActionRunner(
      MenuResolver menuResolver,
      ResultMapper resultMapper,
      ReflectionHelper reflectionHelper,
      StartJourneyCommandHandler startJourneyCommandHandler) {
    super();
    this.menuResolver = menuResolver;
    this.resultMapper = resultMapper;
    this.reflectionHelper = reflectionHelper;
    this.startJourneyCommandHandler = startJourneyCommandHandler;
  }

  @Override
  public boolean applies(Object viewInstance, String actionId, Map<String, Object> contextData) {
    return viewInstance instanceof Directory;
  }

  @Override
  public Mono<UIIncrement> run(
      Object viewInstance,
      String stepId,
      String actionId,
      String componentId,
      Map<String, Object> data,
      Map<String, Object> contextData,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    var menuEntry = menuResolver.resolve(viewInstance, actionId, serverHttpRequest).orElse(null);
    var result = startJourneyCommandHandler.createInstanceFromMenuMapping(menuEntry);
    return resultMapper.processResult(
        viewInstance,
        reflectionHelper.getMethod(DirectoryActionRunner.class, "run"),
        data,
        serverHttpRequest,
        result,
        componentId);
  }
}
