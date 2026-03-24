package io.mateu.mdd.specdrivengenerator.application.usecases.project.generatecode;

import freemarker.template.TemplateException;
import io.mateu.annotationprocessing.Formatter;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.AggregateEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.ModuleEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.ProjectEntity;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;

@Service
@Repository
@RequiredArgsConstructor
@Slf4j
public class GenerateCodeUseCase {

    final CommonFileRepository repository;

    public void handle(GenerateCodeCommand command) {

        var project = repository.findById(command.projectId(), ProjectEntity.class).orElseThrow();
        var packageDir = project.packageName().replace(".", "/");

        createDir(project.outputPath(), "");
        createDir(project.outputPath(), "src/main/java/" + packageDir);
        createDir(project.outputPath(), "src/main/java/" + packageDir + "/application/usecases");
        createDir(project.outputPath(), "src/main/java/" + packageDir + "/application/out");
        createDir(project.outputPath(), "src/main/java/" + packageDir + "/application/query/dto");
        createDir(project.outputPath(), "src/main/java/" + packageDir + "/domain/aggregates/shared/vo");
        createDir(project.outputPath(), "src/main/java/" + packageDir + "/infra/in/ui");
        createDir(project.outputPath(), "src/main/java/" + packageDir + "/infra/in/ui/pages");
        createDir(project.outputPath(), "src/main/java/" + packageDir + "/infra/in/ui/suppliers");
        createDir(project.outputPath(), "src/main/java/" + packageDir + "/infra/out/persistence");
        createDir(project.outputPath(), "src/main/resources");
        createDir(project.outputPath(), "src/test/java");
        createDir(project.outputPath(), "src/test/resources");

        createFile(project.outputPath(), project, "pom.ftl", "pom.xml");
        createFile(project.outputPath(), project, "application-yaml.ftl", "src/main/resources/application.yaml");
        createFile(project.outputPath(), project, "application.ftl", "src/main/java/" + packageDir + "/UsersServiceApplication.java");

        createFile(project.outputPath(), project, "repository.ftl", "src/main/java/" + packageDir + "/application/out/Repository.java");
        createFile(project.outputPath(), project, "queryservice.ftl", "src/main/java/" + packageDir + "/application/query/QueryService.java");
        createFile(project.outputPath(), project, "home.ftl", "src/main/java/" + packageDir + "/infra/in/ui/Home.java");

        project.moduleIds().stream().map(moduleId -> repository.findById(moduleId, ModuleEntity.class).orElseThrow()).forEach(module -> {
            module.aggregateIds().stream().map(aggregateId -> repository.findById(aggregateId, AggregateEntity.class).orElseThrow()).forEach(aggregate -> {
                var aggregatePackageName = aggregate.name().toLowerCase();
                createDir(project.outputPath(), "src/main/java/" + packageDir + "/application/usecases/" + aggregatePackageName + "/create");
                createFile(project.outputPath(), project, aggregate, "aggregate-repository.ftl", "src/main/java/" + packageDir + "/application/out/" + aggregate.name() + "Repository.java");
                createFile(project.outputPath(), project, aggregate, "aggregate-queryservice.ftl", "src/main/java/" + packageDir + "/application/query/" + aggregate.name() + "QueryService.java");
                createFile(project.outputPath(), project, aggregate, "row.ftl", "src/main/java/" + packageDir + "/application/query/dto/" + aggregate.name() + "Row.java");
                createFile(project.outputPath(), project, aggregate, "dto.ftl", "src/main/java/" + packageDir + "/application/query/dto/" + aggregate.name() + "Dto.java");
                createFile(project.outputPath(), project, aggregate, "create-command.ftl", "src/main/java/" + packageDir + "/application/usecases/" + aggregatePackageName + "/create/Create" + aggregate.name() + "Command.java");
                createFile(project.outputPath(), project, aggregate, "create-usecase.ftl", "src/main/java/" + packageDir + "/application/usecases/" + aggregatePackageName + "/create/Create" + aggregate.name() + "UseCase.java");
                createDir(project.outputPath(), "src/main/java/" + packageDir + "/application/usecases/" + aggregatePackageName + "/update");
                createFile(project.outputPath(), project, aggregate, "update-command.ftl", "src/main/java/" + packageDir + "/application/usecases/" + aggregatePackageName + "/update/Update" + aggregate.name() + "Command.java");
                createFile(project.outputPath(), project, aggregate, "update-usecase.ftl", "src/main/java/" + packageDir + "/application/usecases/" + aggregatePackageName + "/update/Update" + aggregate.name() + "UseCase.java");
                createDir(project.outputPath(), "src/main/java/" + packageDir + "/application/usecases/" + aggregatePackageName + "/delete");
                createFile(project.outputPath(), project, aggregate, "delete-command.ftl", "src/main/java/" + packageDir + "/application/usecases/" + aggregatePackageName + "/delete/Delete" + aggregate.name() + "Command.java");
                createFile(project.outputPath(), project, aggregate, "delete-usecase.ftl", "src/main/java/" + packageDir + "/application/usecases/" + aggregatePackageName + "/delete/Delete" + aggregate.name() + "UseCase.java");
                createDir(project.outputPath(), "src/main/java/" + packageDir + "/domain/aggregates/" + aggregatePackageName);
                createDir(project.outputPath(), "src/main/java/" + packageDir + "/domain/aggregates/" + aggregatePackageName + "/vo");
                createFile(project.outputPath(), project, aggregate, "vo-id.ftl", "src/main/java/" + packageDir + "/domain/aggregates/" + aggregatePackageName + "/vo/" + aggregate.name() + "Id.java");
                createFile(project.outputPath(), project, aggregate, "vo-name.ftl", "src/main/java/" + packageDir + "/domain/aggregates/" + aggregatePackageName + "/vo/" + aggregate.name() + "Name.java");
                createFile(project.outputPath(), project, aggregate, "aggregate.ftl", "src/main/java/" + packageDir + "/domain/aggregates/" + aggregatePackageName + "/" + aggregate.name() + ".java");
                createFile(project.outputPath(), project, aggregate, "dbentity.ftl", "src/main/java/" + packageDir + "/infra/out/persistence/" + aggregate.name() + "Entity.java");
                createFile(project.outputPath(), project, aggregate, "dbrepository.ftl", "src/main/java/" + packageDir + "/infra/out/persistence/" + aggregate.name() + "DBRepository.java");
                createFile(project.outputPath(), project, aggregate, "dbqueryservice.ftl", "src/main/java/" + packageDir + "/infra/out/persistence/" + aggregate.name() + "DBQueryService.java");
                createFile(project.outputPath(), project, aggregate, "entityrepository.ftl", "src/main/java/" + packageDir + "/infra/out/persistence/" + aggregate.name() + "EntityRepository.java");
                createDir(project.outputPath(), "src/main/java/" + packageDir + "/infra/in/ui/pages/" + aggregatePackageName);
                createFile(project.outputPath(), project, aggregate, "crud-adapter.ftl", "src/main/java/" + packageDir + "/infra/in/ui/pages/" + aggregatePackageName + "/" + aggregate.name() + "CrudAdapter.java");
                createFile(project.outputPath(), project, aggregate, "crud-orchestrator.ftl", "src/main/java/" + packageDir + "/infra/in/ui/pages/" + aggregatePackageName + "/" + aggregate.name() + "CrudOrchestrator.java");
                createFile(project.outputPath(), project, aggregate, "crud-viewmodel.ftl", "src/main/java/" + packageDir + "/infra/in/ui/pages/" + aggregatePackageName + "/" + aggregate.name() + "ViewModel.java");
                createFile(project.outputPath(), project, aggregate, "options-supplier.ftl", "src/main/java/" + packageDir + "/infra/in/ui/suppliers/" + aggregate.name() + "IdOptionsSupplier.java");
                createFile(project.outputPath(), project, aggregate, "label-supplier.ftl", "src/main/java/" + packageDir + "/infra/in/ui/suppliers/" + aggregate.name() + "IdLabelSupplier.java");
            });
        });

    }

    @SneakyThrows
    private void createFile(String baseDir, ProjectEntity project, AggregateEntity aggregate, String template, String destFile) {
        Map<String, Object> model = new HashMap<>();
        model.put("project", fromJson(toJson(project)));
        model.put("aggregate", fromJson(toJson(aggregate)));
        createFile(baseDir, model, template, destFile);
    }

    @SneakyThrows
    private void createFile(String baseDir, ProjectEntity project, String template, String destFile) {
        Map<String, Object> model = new HashMap<>();
        model.put("project", projectToMap(project));
        createFile(baseDir, model, template, destFile);
    }

    private Map<String, Object> projectToMap(ProjectEntity project) {
        var map = new HashMap<String, Object>();
        map.putAll(fromJson(toJson(project)));
        map.put("modules", ((List<String>)map.get("moduleIds")).stream().map(moduleId -> moduleToMap(repository.findById(moduleId, ModuleEntity.class).orElseThrow())).toList());
        return map;
    }

    private Map<String, Object> moduleToMap(ModuleEntity module) {
        var map = new HashMap<String, Object>();
        map.putAll(fromJson(toJson(module)));
        map.put("aggregates", ((List<String>)map.get("aggregateIds")).stream().map(aggregateId -> aggregateToMap(repository.findById(aggregateId, AggregateEntity.class).orElseThrow())).toList());
        return map;
    }

    private Map<String, Object> aggregateToMap(AggregateEntity aggregate) {
        var map = new HashMap<String, Object>();
        map.putAll(fromJson(toJson(aggregate)));
        //map.put("aggregates", ((List<String>)map.get("aggregateIds")).stream().map(aggregateId -> toMap(repository.findById(aggregateId, AggregateEntity.class)))).toList();
        return map;
    }

    @SneakyThrows
    private void createFile(String baseDir, Map<String, Object> model, String template, String destFile) {
        var file = new File(baseDir + File.separator + destFile);
        var out = new PrintWriter(file);
        var formatter = new Formatter(template, model);
        try {
            out.print(formatter.apply());
        } catch (TemplateException ex) {
            ex.printStackTrace();
        }
        out.close();
    }

    private void createDir(String baseDir, String path) {
        File file = new File(baseDir + File.separator + path);
        if (!file.exists()) {
            file.mkdirs();
        }
    }

}
