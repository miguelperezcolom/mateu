package io.mateu.remote.domain.persistence;

import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import io.mateu.util.persistence.EntityDeserializer;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.Map;

@Service@Scope("prototype")
public class Merger {

    @PersistenceContext
    EntityManager em;

    @Transactional
    public void merge(Object entity) {
        em.merge(entity);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void mergeAndCommit(Object entity) {
        em.merge(entity);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void mergeAndCommit(Map<String, Object> data, Class entityClass) throws Exception {
        Object entity = Helper.getImpl(EntityDeserializer.class).fromJson(em, Helper.toJson(data), entityClass);
        em.merge(entity);
    }


}