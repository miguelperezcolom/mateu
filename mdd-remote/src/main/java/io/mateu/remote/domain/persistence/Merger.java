package io.mateu.remote.domain.persistence;

import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Service@Scope("prototype")
public class Merger {

    @PersistenceContext
    EntityManager em;

    public void merge(Object entity) {
        em.merge(entity);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void mergeAndCommit(Object entity) {
        em.merge(entity);
    }

}
