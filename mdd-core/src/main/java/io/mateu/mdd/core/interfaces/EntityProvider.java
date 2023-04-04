package io.mateu.mdd.core.interfaces;

import jakarta.persistence.EntityManager;

public interface EntityProvider {

    Object toEntity(EntityManager em);

}
