package io.mateu.mdd.specdrivengenerator.domain.aggregates.module;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleName;
import lombok.Getter;

@Getter
public class Module {

    private ModuleId id;
    private ModuleName name;

    public static Module of(ModuleId id, ModuleName name) {
        var aggregate = new Module();
        aggregate.id = id;
        aggregate.name = name;
        return aggregate;
    }

    public void update(ModuleName name) {
        this.name = name;
    }
}
