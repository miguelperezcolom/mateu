package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.project;

import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectDto;
import io.mateu.mdd.specdrivengenerator.application.usecases.project.create.CreateProjectCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.project.create.CreateProjectUseCase;
import io.mateu.mdd.specdrivengenerator.application.usecases.project.save.SaveProjectCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.project.save.SaveProjectUseCase;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.ModuleIdLabelSupplier;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.ModuleIdOptionsSupplier;
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
public class ProjectViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {
    @GeneratedValue(UUIDValueGenerator.class)
    @Hidden
    String id;
    @NotEmpty String name;
    @NotEmpty
    String outputPath;
    @NotEmpty
    String packageName;
    @ForeignKey(search = ModuleIdOptionsSupplier.class, label = ModuleIdLabelSupplier.class)
    List<String> modules;

    final CreateProjectUseCase createUseCase;
    final SaveProjectUseCase saveUseCase;

    @Override
    public String create(HttpRequest httpRequest) {
        createUseCase.handle(new CreateProjectCommand(id, name, outputPath, packageName, modules));
        return id;
    }

    @Override
    public void save(HttpRequest httpRequest) {
        saveUseCase.handle(new SaveProjectCommand(id, name, outputPath, packageName, modules));
    }

    @Override
    public String id() {
        return id;
    }

    public ProjectViewModel load(ProjectDto model) {
        id = model.id();
        name = model.name();
        outputPath = model.outputPath();
        packageName = model.packageName();
        modules = model.moduleIds();
        return this;
    }

    @Override
    public String toString() {
        return id != null ? name : "New project";
    }

}
