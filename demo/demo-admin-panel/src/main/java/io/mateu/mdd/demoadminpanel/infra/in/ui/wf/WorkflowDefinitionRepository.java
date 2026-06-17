package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.workflow.domain.aggregates.WorkflowDefinition;

public interface WorkflowDefinitionRepository extends CrudRepository<WorkflowDefinition> {
}
