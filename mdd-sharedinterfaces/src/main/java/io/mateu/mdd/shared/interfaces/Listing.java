package io.mateu.mdd.shared.interfaces;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.shared.SlimHelper;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.ui.MDDUIAccessor;

import java.lang.reflect.ParameterizedType;
import java.util.List;
import java.util.Set;

public interface Listing<SearchForm, Row> {

    List<Row> fetchRows(SearchForm filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable;

   int fetchCount(SearchForm filters) throws Throwable;

    default String getCaption() {
        if (getClass().isAnnotationPresent(Caption.class)) {
            return getClass().getAnnotation(Caption.class).value();
        }
        try {
            if (!getClass().getMethod("toString").getDeclaringClass().equals(Object.class)) {
                return toString();
            }
        } catch (NoSuchMethodException e) {
        }
        return SlimHelper.capitalize(getClass().getSimpleName());
    }

    default Set<Row> getSelectedRows() {
        return MDDUIAccessor.getSelectedRows();
    }

    default boolean showCheckboxForSelection() {
        return false;
    }

    default Class<SearchForm> getSearchFormClass() {
        return (Class<SearchForm>) ((ParameterizedType) getClass().getGenericInterfaces()[0]).getActualTypeArguments()[0];
    }

    default Class<Row> getRowClass() {
        return (Class<Row>) ((ParameterizedType) getClass().getGenericInterfaces()[0]).getActualTypeArguments()[1];
    }

}
