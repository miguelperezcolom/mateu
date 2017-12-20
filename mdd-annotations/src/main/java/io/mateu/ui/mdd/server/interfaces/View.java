package io.mateu.ui.mdd.server.interfaces;

import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.UserData;

import javax.persistence.EntityManager;

public interface View<T> {

    default String getFields() {
        return null;
    }

    default String getParams() {
        return null;
    }

    default String getCols() {
        return null;
    }

    default String getOrderCriteria() {
        return null;
    }

    default String getAdditionalFilters(EntityManager em, UserData user, Data parameters) {
        return null;
    }


    default String buildQuery(EntityManager em, UserData user, Data parameters) {
        return null;
    }
}
