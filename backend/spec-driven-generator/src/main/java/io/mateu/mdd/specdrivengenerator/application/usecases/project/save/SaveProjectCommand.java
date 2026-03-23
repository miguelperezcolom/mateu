package io.mateu.mdd.specdrivengenerator.application.usecases.project.save;

import java.util.List;

public record SaveProjectCommand(String id, String name, List<String> moduleIds) {

    public SaveProjectCommand {
        if (moduleIds == null) moduleIds = List.of();
    }
}
