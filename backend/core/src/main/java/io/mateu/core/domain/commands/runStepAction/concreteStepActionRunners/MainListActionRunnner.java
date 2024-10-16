package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.usecases.AllEditableFieldsProvider;
import io.mateu.core.domain.model.reflection.usecases.ManagedTypeChecker;
import io.mateu.core.domain.model.reflection.usecases.MethodProvider;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.UIIncrement;
import java.util.List;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class MainListActionRunnner extends RunMethodActionRunner implements ActionRunner {

  private final List<ListActionRunner> listActionRunners;
  final Merger merger;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;
  final ValidationService validationService;
  private final AllEditableFieldsProvider allEditableFieldsProvider;
  private final ResultMapper resultMapper;

  public MainListActionRunnner(
      List<ListActionRunner> listActionRunners,
      Merger merger,
      ActualValueExtractor actualValueExtractor,
      ReflectionHelper reflectionHelper,
      Serializer serializer,
      ValidationService validationService,
      ComponentFactory componentFactory,
      UIIncrementFactory uIIncrementFactory,
      MethodParametersEditorHandler methodParametersEditorHandler,
      MethodProvider methodProvider,
      AllEditableFieldsProvider allEditableFieldsProvider,
      ManagedTypeChecker managedTypeChecker,
      ResultMapper resultMapper) {
    super(
        merger,
        actualValueExtractor,
        reflectionHelper,
        serializer,
        validationService,
        componentFactory,
        uIIncrementFactory,
        methodParametersEditorHandler,
        methodProvider,
        managedTypeChecker,
        resultMapper);
    this.listActionRunners = listActionRunners;
    this.merger = merger;
    this.actualValueExtractor = actualValueExtractor;
    this.reflectionHelper = reflectionHelper;
    this.serializer = serializer;
    this.validationService = validationService;
    this.allEditableFieldsProvider = allEditableFieldsProvider;
    this.resultMapper = resultMapper;
  }

  @Override
  public boolean applies(Object viewInstance, String actionId, Map<String, Object> contextData) {
    return viewInstance instanceof Listing<?, ?>;
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

    Listing rpcView = (Listing) viewInstance;

    if (rpcView instanceof Crud) {
      Crud crud = (Crud) rpcView;

      for (ListActionRunner listActionRunner : listActionRunners) {
        if (listActionRunner.applies(crud, actionId)) {
          return listActionRunner.run(crud, stepId, actionId, data, contextData, serverHttpRequest);
        }
      }
    }

    return super.run(
        rpcView,
        stepId,
        actionId.substring(actionId.lastIndexOf("__") + 2),
        componentId,
        data,
        contextData,
        serverHttpRequest);
  }
}
