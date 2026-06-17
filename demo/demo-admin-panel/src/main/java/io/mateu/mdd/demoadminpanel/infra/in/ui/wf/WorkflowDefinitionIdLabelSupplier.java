package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.workflow.application.out.WorkflowDefinitionRepository;
import io.mateu.workflow.domain.aggregates.WorkflowDefinition;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.stereotype.Service;

@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@Service
@RequiredArgsConstructor
public class WorkflowDefinitionIdLabelSupplier implements LookupLabelSupplier {

    final WorkflowDefinitionRepository workflowDefinitionRepository;

    @Override
    public String label(String fieldId, Object id, HttpRequest httpRequest) {
        if (id == null) {
            return null;
        }
        return workflowDefinitionRepository.findById((String) id)
                .map(WorkflowDefinition::name)
                .orElse(null);
    }
}
