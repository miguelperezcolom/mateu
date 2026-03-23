package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.InvariantRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.Invariant;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InvariantFileRepository implements InvariantRepository {
    @Override
    public Optional<Invariant> findById(InvariantId id) {
        return Optional.empty();
    }

    @Override
    public InvariantId save(Invariant entity) {
        return null;
    }

    @Override
    public void deleteAllById(List<InvariantId> selectedIds) {

    }
}
