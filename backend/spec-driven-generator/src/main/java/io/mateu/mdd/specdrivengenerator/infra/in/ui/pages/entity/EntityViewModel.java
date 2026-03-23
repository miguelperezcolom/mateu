package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.entity;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityDto;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.create.CreateAggregateCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.create.CreateAggregateUseCase;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.save.SaveAggregateCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.save.SaveAggregateUseCase;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@RequiredArgsConstructor
public class EntityViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {
    @EditableOnlyWhenCreating
    @NotEmpty
    String id;
    @NotEmpty String name;

    final CreateAggregateUseCase createUseCase;
    final SaveAggregateUseCase saveUseCase;

    @Override
    public String create(HttpRequest httpRequest) {
        createUseCase.handle(new CreateAggregateCommand(id, name));
        return id;
    }

    @Override
    public void save(HttpRequest httpRequest) {
        saveUseCase.handle(new SaveAggregateCommand(id, name));
    }

    @Override
    public String id() {
        return id;
    }

    public EntityViewModel load(EntityDto model) {
        id = model.id();
        name = model.name();
        return this;
    }

    @Override
    public String toString() {
        return id != null ? name : "New aggregate";
    }
}
