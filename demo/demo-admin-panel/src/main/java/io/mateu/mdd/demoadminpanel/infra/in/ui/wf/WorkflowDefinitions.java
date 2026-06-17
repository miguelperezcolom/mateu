package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudAdapter;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudOrchestrator;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.DispatchEventData;
import io.mateu.uidl.data.NavigationRequestedPayload;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.workflow.application.usecases.workingcopy.CreateWorkingCopyUseCase;
import io.mateu.workflow.application.usecases.workingcopy.PromoteWorkingCopyUseCase;
import io.mateu.workflow.domain.aggregates.WorkflowDefinition;
import io.mateu.workflow.infra.in.ui.WorkflowHome;
import io.mateu.workflow.infra.in.ui.adapters.WorkflowDefinitionCrudAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@Service
@Scope("prototype")
@RequiredArgsConstructor
public class WorkflowDefinitions extends AutoCrudOrchestrator<WorkflowDefinition> {

    final WorkflowDefinitionEditor graphEditor;
    final WorkflowDefinitionCrudAdapter adapter;
    final CreateWorkingCopyUseCase createWorkingCopyUseCase;
    final PromoteWorkingCopyUseCase promoteWorkingCopyUseCase;

    @Override
    public AutoCrudAdapter<WorkflowDefinition> simpleAdapter() {
        return adapter;
    }

    @Override
    public String getStyleForView() {
        return StyleConstants.FULL_WIDTH_WITH_PADDING;
    }

    @ListToolbarButton
    public void importFromGithub() throws Exception {
        throw new Exception("No configured");
    }

    @ViewToolbarButton
    public WorkflowDefinitionEditor graphEditor(WorkflowDefinition definition) {
        return graphEditor.load(definition.id());
    }

    @ViewToolbarButton
    public UICommand createWorkingCopy(WorkflowDefinition definition, HttpRequest httpRequest) {
        return UICommand.builder()
                .type(UICommandType.DispatchEvent)
                .data(new DispatchEventData(
                        "navigation-requested",
                        NavigationRequestedPayload.builder()
                                .route("/workflow/definitions/" + createWorkingCopyUseCase.handle(definition.id()))
                                .consumedRoute("")
                                .baseUrl(httpRequest.getBaseUrl())
                                .uriPrefix("")
                                .serverSideType(WorkflowHome.class.getName())
                                .build()
                ))
                .build();

    }

    @ViewToolbarButton
    public UICommand promoteToProduction(WorkflowDefinition definition, HttpRequest httpRequest) {
        return UICommand.builder()
                .type(UICommandType.DispatchEvent)
                .data(new DispatchEventData(
                        "navigation-requested",
                        NavigationRequestedPayload.builder()
                                .route("/workflow/definitions/" + promoteWorkingCopyUseCase.handle(definition.id()))
                                .consumedRoute("")
                                .baseUrl(httpRequest.getBaseUrl())
                                .uriPrefix("")
                                .serverSideType(WorkflowHome.class.getName())
                                .build()
                ))
                .build();
    }

}
