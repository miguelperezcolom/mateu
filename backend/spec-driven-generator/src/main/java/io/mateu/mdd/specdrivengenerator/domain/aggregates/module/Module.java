package io.mateu.mdd.specdrivengenerator.domain.aggregates.module;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleName;
import lombok.Getter;

import java.util.List;

@Getter
public class Module {

    private ModuleId id;
    private ModuleName name;
    private List<AggregateId> aggregateIds;

    public static Module of(ModuleId id, ModuleName name, List<AggregateId> aggregateIds) {
        var module = new Module();
        module.id = id;
        module.name = name;
        module.aggregateIds = aggregateIds;
        return module;
    }

    public static Module load(String id, String name, List<String> aggregateIds) {
        var module = new Module();
        module.id = new ModuleId(id);
        module.name = new ModuleName(name);
        module.aggregateIds = aggregateIds.stream().map(AggregateId::new).toList();
        return module;
    }

    public void update(ModuleName name, List<AggregateId> aggregateIds) {
        this.name = name;
        this.aggregateIds = aggregateIds;
    }
}
