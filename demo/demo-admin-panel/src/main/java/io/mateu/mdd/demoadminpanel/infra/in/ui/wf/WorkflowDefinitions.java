package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.mdd.demoadminpanel.infra.in.ui.Home2;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.*;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;


@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@Service
@Scope("prototype")
@RequiredArgsConstructor
public class WorkflowDefinitions extends AutoCrud<WorkflowDefinition> {

    final WorkflowDefinitionRepository repository;

    @Override
    public io.mateu.uidl.interfaces.CrudRepository<WorkflowDefinition> store() {
        return repository;
    }

    @Override
    public String getStyleForView() {
        return StyleConstants.FULL_WIDTH_WITH_PADDING;
    }

    @ListToolbarButton
    public void importFromGithub() throws Exception {
        throw new Exception("No configured");
    }

/*
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
                                .serverSideType(Home2.class.getName())
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
*/
}
