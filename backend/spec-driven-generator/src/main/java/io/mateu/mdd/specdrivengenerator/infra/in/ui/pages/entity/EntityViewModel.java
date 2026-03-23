package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.entity;

import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityDto;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.create.CreateAggregateCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.create.CreateAggregateUseCase;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.save.SaveAggregateCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.save.SaveAggregateUseCase;
import io.mateu.mdd.specdrivengenerator.application.usecases.entity.create.CreateEntityCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.entity.create.CreateEntityUseCase;
import io.mateu.mdd.specdrivengenerator.application.usecases.entity.save.SaveEntityCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.entity.save.SaveEntityUseCase;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
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

@Service
@Scope("prototype")
@RequiredArgsConstructor
public class EntityViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {
    @GeneratedValue(UUIDValueGenerator.class)
    @Hidden
    String id;
    @NotEmpty String name;

    final CreateEntityUseCase createUseCase;
    final SaveEntityUseCase saveUseCase;

    @Override
    public String create(HttpRequest httpRequest) {
        createUseCase.handle(new CreateEntityCommand(id, name));
        return id;
    }

    @Override
    public void save(HttpRequest httpRequest) {
        saveUseCase.handle(new SaveEntityCommand(id, name));
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
        return id != null ? name : "New entity";
    }
}
