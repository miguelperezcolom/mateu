package io.mateu.mdd.core.interfaces;


import io.mateu.mdd.core.data.Data;

import javax.persistence.EntityManager;

public interface ListView<T> {

    default String getViewTitle() { return null; };

    default String getParams() {
        return null;
    }

    default String getSums() {
        return null;
    }

    default String getCols() {
        return null;
    }

    default String getColHeaders() {
        return null;
    }

    default String getOrderCriteria() {
        return null;
    }

    default String getAdditionalFilters(EntityManager em, Data parameters) {
        return null;
    }


    default String buildQuery(EntityManager em, Data parameters) {
        return null;
    }

    default String getQLFilter(EntityManager em, String field) {
        return null;
    }


}
