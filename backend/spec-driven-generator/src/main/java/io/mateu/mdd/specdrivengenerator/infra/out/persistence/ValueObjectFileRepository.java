package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.ValueObjectRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.ValueObject;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectId;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ValueObjectFileRepository implements ValueObjectRepository {
    @Override
    public Optional<ValueObject> findById(ValueObjectId id) {
        return Optional.empty();
    }

    @Override
    public ValueObjectId save(ValueObject entity) {
        return null;
    }

    @Override
    public void deleteAllById(List<ValueObjectId> selectedIds) {

    }
}
