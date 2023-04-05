package io.mateu.remote.infra.jpa;

import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service@Primary
public class JpaJourneyRepository implements JourneyRepository {

    @PersistenceContext
    EntityManager em;

    @Override
    public Optional<JourneyContainer> findById(String journeyId) {
        JourneyContainerEntity entity = em.find(JourneyContainerEntity.class, journeyId);
        if (entity == null) {
            return Optional.empty();
        }
        update(entity);
        return Optional.of(entity.getJourneyContainer());
    }

    @Override
    public void save(JourneyContainer journeyContainer) {
        em.merge(new JourneyContainerEntity(journeyContainer.getJourneyId(), journeyContainer, LocalDateTime.now()));
    }

    @Override
    public List<JourneyContainer> findAll() {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<JourneyContainerEntity> cr = cb.createQuery(JourneyContainerEntity.class);
        return em.createQuery(cr).getResultList().stream().map(e -> e.getJourneyContainer())
                .collect(Collectors.toList());
    }

    @Override
    public long count() {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<JourneyContainerEntity> cr = cb.createQuery(JourneyContainerEntity.class);
        return em.createQuery(cr).getResultList().size();
    }

    @Async
    public void update(JourneyContainerEntity entity) {
        entity.setLastUsed(LocalDateTime.now());
        em.merge(entity);
    }
}
