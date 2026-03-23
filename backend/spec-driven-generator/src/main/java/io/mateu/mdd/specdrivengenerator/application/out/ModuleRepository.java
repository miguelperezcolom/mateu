package io.mateu.mdd.specdrivengenerator.application.out;

import io.mateu.mdd.specdrivengenerator.application.shared.Repository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.Module;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;

public interface ModuleRepository extends Repository<Module, ModuleId> {
}
