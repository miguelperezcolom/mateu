package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.InvariantRepository;
import io.mateu.mdd.specdrivengenerator.application.out.ModuleRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.Invariant;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.Module;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.EntityEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.ModuleEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ModuleFileRepository implements ModuleRepository {

    final CommonFileRepository repository;

    @Override
    public Optional<Module> findById(ModuleId id) {
        return repository.findById(id.id(), ModuleEntity.class)
                .map(entity -> Module.load(entity.id(), entity.name()));
    }

    @Override
    public Module save(Module entity) {
        repository.save(new ModuleEntity(entity.getId().id(), entity.getName().name(), List.of()));
        return entity;
    }

    @Override
    public void deleteAllById(List<ModuleId> selectedIds) {
        repository.deleteAllById(selectedIds.stream().map(ModuleId::id).toList());
    }
}
