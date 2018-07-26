package io.mateu.mdd.core.interfaces;

import com.vaadin.ui.Grid;

import java.util.List;

public interface RpcView<F, C> {

    List<C> rpc(F filters, int offset, int limit);

    int gatherCount(F filters);

    default void decorateGrid(Grid<C> grid) {

    };

}
