package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;

import java.util.List;
import java.util.Set;

public interface Crud<SearchForm, Row> extends Listing<SearchForm, Row> {

    @Override
    default boolean showCheckboxForSelection() {
        return !ReflectionHelper.getMethod(getClass(), "delete").getDeclaringClass().isInterface();
    }

    default Object getNewRecordForm() throws Throwable {
        return null;
    }

    default Object getDetail(Row row) throws Throwable {
        return null;
    }

    default void delete(List<Row> selection) throws Throwable {

    }
}
