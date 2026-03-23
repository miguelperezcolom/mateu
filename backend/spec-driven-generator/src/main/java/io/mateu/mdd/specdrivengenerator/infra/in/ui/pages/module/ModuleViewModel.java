package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.module;

import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleDto;
import io.mateu.mdd.specdrivengenerator.application.usecases.module.create.CreateModuleCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.module.create.CreateModuleUseCase;
import io.mateu.mdd.specdrivengenerator.application.usecases.module.save.SaveModuleCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.module.save.SaveModuleUseCase;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.AggregateIdLabelSupplier;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.AggregateIdOptionsSupplier;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.ModuleIdLabelSupplier;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.ModuleIdOptionsSupplier;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Hidden;
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
public class ModuleViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {
    @GeneratedValue(UUIDValueGenerator.class)
    @Hidden
    String id;
    @NotEmpty String name;
    @ForeignKey(search = AggregateIdOptionsSupplier.class, label = AggregateIdLabelSupplier.class)
    List<String> aggregates;

    final CreateModuleUseCase createUseCase;
    final SaveModuleUseCase saveUseCase;

    @Override
    public String create(HttpRequest httpRequest) {
        createUseCase.handle(new CreateModuleCommand(id, name, aggregates));
        return id;
    }

    @Override
    public void save(HttpRequest httpRequest) {
        saveUseCase.handle(new SaveModuleCommand(id, name, aggregates));
    }

    @Override
    public String id() {
        return id;
    }

    public ModuleViewModel load(ModuleDto model) {
        id = model.id();
        name = model.name();
        aggregates = model.aggregateIds();
        return this;
    }

    @Override
    public String toString() {
        return id != null ? name : "New aggregate";
    }
}
