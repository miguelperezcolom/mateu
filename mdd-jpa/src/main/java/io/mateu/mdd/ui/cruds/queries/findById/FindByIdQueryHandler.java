package io.mateu.mdd.ui.cruds.queries.findById;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Service
public class FindByIdQueryHandler {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Object run(FindByIdQuery query) {
        return em.find(query.getEntityClass(), query.getId());
    }

}
