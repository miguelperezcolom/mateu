package io.mateu.mdd.core.interfaces;

import com.vaadin.ui.Grid;

public interface RowDecorator {

    default void decorateGrid(Grid grid) {

    };
}
