package io.mateu.mdd.core.interfaces;

import com.vaadin.ui.Grid;
import io.mateu.mdd.core.data.SumData;

import java.util.List;

public interface RpcView<F, C> {

    List<C> rpc(F filters, int offset, int limit) throws Throwable;

    default List<SumData> getSums(F filters) {
        return null;
    };

    int gatherCount(F filters) throws Throwable;

    default void decorateGrid(Grid<C> grid) {

    };


    default void buildColumns(Grid<C> grid) {

    };

    default boolean isEditHandled() { return false; }

    default Object onEdit(C row) {
        return null;
    }


    default boolean isSelectHandled() { return false; }

    default Object onSelect(C row) {
        return null;
    }

}
