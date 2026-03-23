package io.mateu.mdd.specdrivengenerator.infra.out.persistence.file;

import java.util.List;

public record AllData(
        List<ProjectEntity> projects,
        List<ModuleEntity> modules,
        List<AggregateEntity> aggregates,
        List<EntityEntity> entities,
        List<ValueObjectEntity> valueObjects,
        List<InvariantEntity> invariants
        ) {

    public AllData {
        projects = projects != null ? projects : List.of();
        modules = modules != null ? modules : List.of();
        aggregates = aggregates != null ? aggregates : List.of();
        entities = entities != null ? entities : List.of();
        valueObjects = valueObjects != null ? valueObjects : List.of();
        invariants = invariants != null ? invariants : List.of();
    }
}
