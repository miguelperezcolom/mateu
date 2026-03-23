package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.aggregate;

import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.AggregateDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.FieldDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantDto;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.create.CreateAggregateCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.create.CreateAggregateUseCase;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.save.SaveAggregateCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.save.SaveAggregateUseCase;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.AggregateIdLabelSupplier;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.AggregateIdOptionsSupplier;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.InvariantIdLabelSupplier;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.InvariantIdOptionsSupplier;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Scope("prototype")
@RequiredArgsConstructor
@Style("width: 100%;")
public class AggregateViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {
    @GeneratedValue(UUIDValueGenerator.class)
    @Hidden
    String id;
    @NotEmpty String name;
    @Tab
            @MasterDetail(minHeightWhenDetailVisible = "24rem")
    List<FieldViewModel> fields;
    @Tab
    @MasterDetail(minHeightWhenDetailVisible = "16rem")
    List<InvariantViewModel> invariants;

    final CreateAggregateUseCase createUseCase;
    final SaveAggregateUseCase saveUseCase;

    @Override
    public String create(HttpRequest httpRequest) {
        createUseCase.handle(new CreateAggregateCommand(id, name,
                fields.stream().map(field -> new FieldDto(
                        field.name(),
                        field.label(),
                        field.type(),
                        field.help(),
                        field.valueObject(),
                        field.entity(),
                        field.mandatory(),
                        field.readonly(),
                        field.visible(),
                        field.editable(),
                        field.searchable(),
                        field.filterable()
                )).toList(),
                invariants.stream()
                        .map(invariantViewModel -> new InvariantDto(
                                invariantViewModel.id(),
                                invariantViewModel.name()
                        ))
                        .toList()
        ));
        return id;
    }

    @Override
    public void save(HttpRequest httpRequest) {
        saveUseCase.handle(new SaveAggregateCommand(id, name,
                fields.stream().map(field -> new FieldDto(
                        field.name(),
                        field.label(),
                        field.type(),
                        field.help(),
                        field.valueObject(),
                        field.entity(),
                        field.mandatory(),
                        field.readonly(),
                        field.visible(),
                        field.editable(),
                        field.searchable(),
                        field.filterable()
                )).toList(),
                invariants.stream().map(invariant -> new InvariantDto(
                        invariant.id(),
                        invariant.name()
                )).toList()
        ));
    }

    @Override
    public String id() {
        return id;
    }

    public AggregateViewModel load(AggregateDto model) {
        id = model.id();
        name = model.name();
        fields = model.fields().stream().map(field -> new FieldViewModel(field.name(),
                field.label(),
                field.type(),
                field.help(),
                field.valueObjectId(),
                field.entityId(),
                field.mandatory(),
                field.readonly(),
                field.visible(),
                field.editable(),
                field.searchable(),
                field.filterable())).toList();
        invariants = model.invariants().stream()
                .map(invariant -> new InvariantViewModel(invariant.id(), invariant.name()))
                .toList();
        return this;
    }

    @Override
    public String toString() {
        return id != null ? name : "New aggregate";
    }
}
