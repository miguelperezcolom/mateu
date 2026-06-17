package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.workflow.infra.in.ui.suppliers.WorkflowDefinitionIdLabelSupplier;
import io.mateu.workflow.infra.in.ui.suppliers.WorkflowDefinitionIdOptionsSupplier;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.With;

@With
@FoldedLayout
public record Step(
        @Section(value = "Main", style = "width: 25%;")
        @NotEmpty
        String id,
        @Hidden
        String workflowDefinitionId,
        @NotNull
        StepType type,
        @NotEmpty
        String name,
        @HiddenInList
        @Stereotype(FieldStereotype.textarea)
        String description,
        @Section(value = "Precondition", style = "width: 25%;")

        //@HiddenInList
        //StepPrecondition precondition,
        @Lookup(bubble = true)
        String preconditionStepId,
        String preconditionExpression,

        @Section(value = "Execution", style = "width: 25%;")
        boolean parallel,
        @HiddenInList
        @Hidden("state['type'] != 'ACTION'")
        String topic,
        @HiddenInList
        @Hidden("state['type'] != 'USER_TASK'")
        String formId,
        @HiddenInList
        @Hidden("state['type'] != 'PROCESS'")
        @Lookup(search = WorkflowDefinitionIdOptionsSupplier.class, label = WorkflowDefinitionIdLabelSupplier.class)
        String childWorkflowDefinitionId,
        @Section(value = "Reliability", style = "width: 25%;")
        @JsonDeserialize(using = TimeoutDeserializer.class)
        long timeout,
        @HiddenInList
        int retries,
        @HiddenInList
        boolean rollbackable,
        @Hidden("!state['rollbackable']")
        @Lookup(bubble = true)
        String compensationStepId
) implements Identifiable {
}
