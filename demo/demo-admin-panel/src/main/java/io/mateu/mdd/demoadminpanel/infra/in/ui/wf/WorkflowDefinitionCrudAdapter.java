package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.AllArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.stereotype.Service;

@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
//@ConditionalOnProperty(name = "workflow.persistence", havingValue = "jpa")
@Service
@AllArgsConstructor
public class WorkflowDefinitionCrudAdapter extends AutoCrudAdapter<WorkflowDefinition> {

    final WorkflowDefinitionRepository repository;

    @Override
    public CrudRepository<WorkflowDefinition> repository() {
        return repository;
    }

}
