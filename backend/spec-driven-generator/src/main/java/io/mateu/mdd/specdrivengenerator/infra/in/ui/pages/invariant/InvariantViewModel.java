package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.invariant;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantDto;
import io.mateu.mdd.specdrivengenerator.application.usecases.invariant.create.CreateInvariantCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.invariant.create.CreateInvariantUseCase;
import io.mateu.mdd.specdrivengenerator.application.usecases.invariant.save.SaveInvariantCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.invariant.save.SaveInvariantUseCase;
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
public class InvariantViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {
    @EditableOnlyWhenCreating
    @NotEmpty
    String id;
    @NotEmpty String name;

    final CreateInvariantUseCase createUseCase;
    final SaveInvariantUseCase saveUseCase;

    @Override
    public String create(HttpRequest httpRequest) {
        createUseCase.handle(new CreateInvariantCommand(id, name));
        return id;
    }

    @Override
    public void save(HttpRequest httpRequest) {
        saveUseCase.handle(new SaveInvariantCommand(id, name));
    }

    @Override
    public String id() {
        return id;
    }

    public InvariantViewModel load(InvariantDto model) {
        id = model.id();
        name = model.name();
        return this;
    }

    @Override
    public String toString() {
        return id != null ? name : "New aggregate";
    }
}
