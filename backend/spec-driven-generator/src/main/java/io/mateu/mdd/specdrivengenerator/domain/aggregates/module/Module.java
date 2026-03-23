package io.mateu.mdd.specdrivengenerator.domain.aggregates.module;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleName;
import lombok.Getter;

@Getter
public class Module {

    private ModuleId id;
    private ModuleName name;

    public static Module of(ModuleId id, ModuleName name) {
        var module = new Module();
        module.id = id;
        module.name = name;
        return module;
    }

    public static Module load(String id, String name) {
        var module = new Module();
        module.id = new ModuleId(id);
        module.name = new ModuleName(name);
        return module;
    }

    public void update(ModuleName name) {
        this.name = name;
    }
}
