package io.mateu.ui.mdd.server.interfaces;

import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.UserData;

import javax.persistence.EntityManager;

public interface View<T> extends ListView<T> {

    default String getFields() {
        return null;
    }

    default boolean isFieldsListedOnly() { return true; }

    default T newInstance(EntityManager em, UserData user) {
        return null;
    }

}
