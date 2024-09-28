package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.usecases.AllEditableFieldsProvider;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.core.domain.model.reflection.usecases.MethodProvider;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.core.domain.uidefinition.shared.interfaces.SelectedRowsContext;
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

  public MainListActionRunnner(
          List<ListActionRunner> listActionRunners,
          Merger merger,
          ActualValueExtractor actualValueExtractor,
          ReflectionHelper reflectionHelper,
          Serializer serializer,
          ValidationService validationService,
          ViewMapper viewMapper,
          ComponentFactory componentFactory,
          UIIncrementFactory uIIncrementFactory,
          BasicTypeChecker basicTypeChecker,
          MethodParametersEditorHandler methodParametersEditorHandler,
          MethodProvider methodProvider, DataExtractor dataExtractor, AllEditableFieldsProvider allEditableFieldsProvider) {
    super(
        merger,
        actualValueExtractor,
        reflectionHelper,
        serializer,
        validationService,
        componentFactory,
        uIIncrementFactory,
        basicTypeChecker,
        methodParametersEditorHandler,
        methodProvider,
        viewMapper,
            dataExtractor,
            allEditableFieldsProvider);
    this.listActionRunners = listActionRunners;
    this.merger = merger;
    this.actualValueExtractor = actualValueExtractor;
    this.reflectionHelper = reflectionHelper;
    this.serializer = serializer;
    this.validationService = validationService;
    this.allEditableFieldsProvider = allEditableFieldsProvider;
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
      Map<String, Object> data,
      Map<String, Object> contextData,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    Listing rpcView = (Listing) viewInstance;

    List selectedRows = (List) data.get("_selectedRows");
    new SelectedRowsContext(selectedRows);

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
        data,
        contextData,
        serverHttpRequest);
  }
}
