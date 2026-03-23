package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.ProjectRepository;
import io.mateu.mdd.specdrivengenerator.application.out.ValueObjectRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.Project;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.ValueObject;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectId;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.ProjectEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.ValueObjectEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ValueObjectFileRepository implements ValueObjectRepository {

    final CommonFileRepository repository;

    @Override
    public Optional<ValueObject> findById(ValueObjectId id) {
        return repository.findById(id.id(), ValueObjectEntity.class)
                .map(entity -> ValueObject.load(entity.id(), entity.name()));
    }

    @Override
    public ValueObject save(ValueObject entity) {
        repository.save(new ValueObjectEntity(entity.getId().id(), entity.getName().name()));
        return entity;
    }

    @Override
    public void deleteAllById(List<ValueObjectId> selectedIds) {
        repository.deleteAllById(selectedIds.stream().map(ValueObjectId::id).toList());
    }
}
