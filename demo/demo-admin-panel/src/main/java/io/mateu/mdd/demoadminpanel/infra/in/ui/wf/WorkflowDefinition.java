package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.data.*;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import io.mateu.uidl.interfaces.Searchable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@FormLayout(columns = 4)
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
public record WorkflowDefinition(
        @GeneratedValue(UUIDValueGenerator.class)
        @HiddenInEditor
        String id,
        @NotEmpty
        String name,
        @Hidden
        int version,
        @Stereotype(FieldStereotype.textarea)
        String description,
        @NotNull
        @Status(defaultStatus = StatusType.NONE, mappings = {
                @StatusMapping(from = "", to = StatusType.NONE),
                @StatusMapping(from = "DISABLED", to = StatusType.DANGER),
                @StatusMapping(from = "ARCHIVED", to = StatusType.NONE),
                @StatusMapping(from = "DRAFT", to = StatusType.WARNING),
                @StatusMapping(from = "ACTIVE", to = StatusType.SUCCESS),
        })
        WorkflowDefinitionStatus status,
        @Hidden
        String draftOfId,
        boolean limitConcurrentExecutions,
        @Min(0)
        @Hidden("!state.limitConcurrentExecutions")
        int maxConcurrentExecutions,
        @Hidden("!state.limitConcurrentExecutions")
        boolean enqueueOnLimit,
        @Colspan(4)
        @DetailFormCustomisation(position = FormPosition.modalRight, style = "display: block; min-width: 70rem;")
        List<Step> steps
) implements Identifiable, Searchable, LookupOptionsSupplier {

    @Override
    public String toString() {
        return id != null?name:"New workflow definition";
    }

    @Override
    public String searchableText() {
        return name + " " + description;
    }

    /**
     * Checks domain invariants that cannot be expressed as field-level annotations.
     *
     * @throws IllegalStateException if any invariant is violated.
     */
    public void checkInvariants() {
        if (steps == null) return;
        for (var step : steps) {
            if (step.id() == null) continue;
            if (step.id().equals(step.preconditionStepId())) {
                throw new IllegalStateException(
                        "Step '" + step.id() + "' cannot have itself as a precondition.");
            }
            if (step.id().equals(step.compensationStepId())) {
                throw new IllegalStateException(
                        "Step '" + step.id() + "' cannot have itself as a compensation step.");
            }
        }
    }

    @Override
    public int maxConcurrentExecutions() {
        return (limitConcurrentExecutions)?maxConcurrentExecutions:1;
    }

    @Override
    public List<Step> steps() {
        return steps != null?steps:List.of();
    }

    @Override
    public ListingData<io.mateu.uidl.data.Option> search(String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(steps.stream()
                .map(step -> new io.mateu.uidl.data.Option(
                        step.id(),
                        step.name()
                ))
                .toList());
    }
}
