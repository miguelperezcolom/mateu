package io.mateu.mdd.specdrivengenerator.application.usecases.project.create;

import java.util.List;

public record CreateProjectCommand(String id, String name, String outputPath, String packageName, List<String> moduleIds) {

}
