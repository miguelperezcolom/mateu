package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.AggregateRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.Aggregate;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AggregateFileRepository implements AggregateRepository {
    @Override
    public Optional<Aggregate> findById(AggregateId id) {
        return Optional.empty();
    }

    @Override
    public AggregateId save(Aggregate entity) {
        return null;
    }

    @Override
    public void deleteAllById(List<AggregateId> selectedIds) {

    }
}
