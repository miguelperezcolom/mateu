package io.mateu.mdd.specdrivengenerator.application.usecases.module.save;

import java.util.List;

public record SaveModuleCommand(String id, String name, List<String> aggregates) {

    public SaveModuleCommand {
        if (aggregates == null) aggregates = List.of();
    }

}
