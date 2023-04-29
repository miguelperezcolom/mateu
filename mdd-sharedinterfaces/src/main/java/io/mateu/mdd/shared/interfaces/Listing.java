package io.mateu.mdd.shared.interfaces;

import io.mateu.mdd.shared.SlimHelper;
import io.mateu.mdd.shared.annotations.Caption;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.lang.reflect.ParameterizedType;
import java.util.List;

public interface Listing<SearchForm, Row> {

    Flux<Row> fetchRows(SearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) throws Throwable;

   Mono<Long> fetchCount(SearchForm filters) throws Throwable;

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

    default boolean showCheckboxForSelection() {
        return false;
    }

    default Class<SearchForm> getSearchFormClass() {
        return (Class<SearchForm>) ((ParameterizedType) getClass().getGenericInterfaces()[0]).getActualTypeArguments()[0];
    }

    default Class<Row> getRowClass() {
        return (Class<Row>) ((ParameterizedType) getClass().getGenericInterfaces()[0]).getActualTypeArguments()[1];
    }

    default List<Row> getSelection() {
        return List.of();
    }

}
