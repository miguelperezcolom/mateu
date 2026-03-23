package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.ModuleRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.Module;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ModuleFileRepository implements ModuleRepository {
    @Override
    public Optional<Module> findById(ModuleId id) {
        return Optional.empty();
    }

    @Override
    public ModuleId save(Module entity) {
        return null;
    }

    @Override
    public void deleteAllById(List<ModuleId> selectedIds) {

    }
}
