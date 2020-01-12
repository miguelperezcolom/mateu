package io.mateu.mdd.core.interfaces;

import javax.persistence.EntityManager;

public interface EntityProvider {

    Object toEntity(EntityManager em);

}
