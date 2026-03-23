package io.mateu.mdd.specdrivengenerator.application.query.dtos;

import java.util.List;

public record ModuleDto(String id, String name, List<String> aggregateIds) {

    public ModuleDto {
        if (aggregateIds == null) aggregateIds = List.of();
    }

}
