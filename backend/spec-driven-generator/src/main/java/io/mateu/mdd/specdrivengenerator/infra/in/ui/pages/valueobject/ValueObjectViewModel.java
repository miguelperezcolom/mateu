package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.valueobject;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.ValueObjectDto;
import io.mateu.mdd.specdrivengenerator.application.usecases.valueobject.create.CreateValueObjectCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.valueobject.create.CreateValueObjectUseCase;
import io.mateu.mdd.specdrivengenerator.application.usecases.valueobject.save.SaveValueObjectCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.valueobject.save.SaveValueObjectUseCase;
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
public class ValueObjectViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {
    @EditableOnlyWhenCreating
    @NotEmpty
    String id;
    @NotEmpty String name;

    final CreateValueObjectUseCase createUseCase;
    final SaveValueObjectUseCase saveUseCase;

    @Override
    public String create(HttpRequest httpRequest) {
        createUseCase.handle(new CreateValueObjectCommand(id, name));
        return id;
    }

    @Override
    public void save(HttpRequest httpRequest) {
        saveUseCase.handle(new SaveValueObjectCommand(id, name));
    }

    @Override
    public String id() {
        return id;
    }

    public ValueObjectViewModel load(ValueObjectDto model) {
        id = model.id();
        name = model.name();
        return this;
    }

    @Override
    public String toString() {
        return id != null ? name : "New aggregate";
    }
}
