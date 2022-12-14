package io.mateu.mdd.shared.interfaces;

import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.ui.Grid;
import io.mateu.mdd.shared.data.SumData;
import io.mateu.mdd.shared.ui.MDDUIAccessor;

import java.util.List;
import java.util.Set;

public interface RpcView<F, C> {

    List<C> rpc(F filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable;

    default List<SumData> getSums(F filters) {
        return null;
    };

    int gatherCount(F filters) throws Throwable;

    default void decorateGrid(Grid<C> grid) {

    };


    default void buildColumns(Grid<C> grid) {

    };

    default boolean isEditHandled() { return false; }

    default Object onEdit(C row) throws Throwable {
        return null;
    }


    default boolean isSelectHandled() { return false; }

    default Object onSelect(C row) {
        return null;
    }

    default Set<C> getSelectedRows() {
        return MDDUIAccessor.getSelectedRows();
    }

    default boolean showCheckboxForSelection() {
        return false;
    }

}
