package io.mateu.mdd.core.interfaces;

import jakarta.persistence.EntityManager;

public interface View<T> extends ListView<T> {

    default String getFields() {
        return null;
    }

    default T newInstance(EntityManager em) {
        return null;
    }

}
