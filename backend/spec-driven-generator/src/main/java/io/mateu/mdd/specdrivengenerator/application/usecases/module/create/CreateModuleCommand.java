package io.mateu.mdd.specdrivengenerator.application.usecases.module.create;

import java.util.List;

public record CreateModuleCommand(String id, String name, List<String> aggregates) {

    public CreateModuleCommand {
        if (aggregates == null) aggregates = List.of();
    }

}
