package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;

import java.util.List;
import java.util.Map;

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


    default Object getRow(Map<String, Object> row) throws Throwable {
        return Helper.fromJson(Helper.toJson(row), getRowClass());
    }

    default void delete(List<Row> selection) throws Throwable {

    }
}
