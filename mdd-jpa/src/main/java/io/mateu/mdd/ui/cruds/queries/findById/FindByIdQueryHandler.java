package io.mateu.mdd.ui.cruds.queries.findById;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class FindByIdQueryHandler {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Object run(FindByIdQuery query) {
        return em.find(query.getEntityClass(), query.getId());
    }

}
