package ${project.packageName}.infra.in.ui.pages.${aggregate.name?lower_case};

import io.mateu.uidl.annotations.HiddenInCreate;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import ${project.packageName}.application.query.dto.${aggregate.name}Dto;
import ${project.packageName}.application.usecases.${aggregate.name?lower_case}.create.Create${aggregate.name}Command;
import ${project.packageName}.application.usecases.${aggregate.name?lower_case}.create.Create${aggregate.name}UseCase;
import ${project.packageName}.application.usecases.${aggregate.name?lower_case}.update.Update${aggregate.name}Command;
import ${project.packageName}.application.usecases.${aggregate.name?lower_case}.update.Update${aggregate.name}UseCase;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.${aggregate.name};
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@RequiredArgsConstructor
public class ${aggregate.name}ViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {
        @HiddenInCreate
        @ReadOnly
        String id;
        @NotEmpty String name;

        final Create${aggregate.name}UseCase create${aggregate.name}UseCase;
        final Update${aggregate.name}UseCase update${aggregate.name}UseCase;

        @Override
        public String create(HttpRequest httpRequest) {
        return create${aggregate.name}UseCase.handle(new Create${aggregate.name}Command(name));
        }

        @Override
        public void save(HttpRequest httpRequest) {
        update${aggregate.name}UseCase.handle(new Update${aggregate.name}Command(id, name));
        }

        @Override
        public String id() {
        return id;
        }

        public ${aggregate.name}ViewModel load(${aggregate.name}Dto ${aggregate.name?lower_case}) {
        id = String.valueOf(${aggregate.name?lower_case}.id());
        name = ${aggregate.name?lower_case}.name();
        return this;
        }

        @Override
        public String toString() {
        return id != null ? name : "New ${aggregate.name?lower_case}";
        }
        }
