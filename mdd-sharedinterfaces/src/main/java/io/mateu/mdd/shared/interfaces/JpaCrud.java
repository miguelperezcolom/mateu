package io.mateu.mdd.shared.interfaces;

import java.util.List;

public interface JpaCrud<E> {

    default List<String> getSearchFilterFields() {
        return null;
    }

    default List<String> getColumnFields() {
        return null;
    }

    default List<String> getEditableFields() {
        return null;
    }

    default String getExtraWhereFilter() {
        return null;
    }

}
