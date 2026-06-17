package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import io.mateu.uidl.data.WorkflowElk;
import io.mateu.workflow.application.out.WorkflowDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.stereotype.Service;

import static io.mateu.core.infra.JsonSerializer.toJson;

@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@Service
@RequiredArgsConstructor
public class WorkflowDefinitionEditor {

    final WorkflowDefinitionRepository repository;

    String workflowId;

    WorkflowElk workflow;


    public WorkflowDefinitionEditor load(String workflowId) {
        this.workflowId = workflowId;
        var def = repository.findById(workflowId).orElseThrow();
        workflow = new WorkflowElk(toJson(def), "", "");
        return this;
    }

}
