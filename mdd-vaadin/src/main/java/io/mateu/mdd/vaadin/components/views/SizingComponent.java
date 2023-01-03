package io.mateu.mdd.vaadin.components.views;

import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.shared.CSS;

public class SizingComponent extends HorizontalLayout {
    private final Button b5;
    private final Button b10;
    private final Button b20;
    private final Button b40;
    private final Grid grid;

    public SizingComponent(Grid grid) {
        setDefaultComponentAlignment(Alignment.MIDDLE_LEFT);
        this.grid = grid;
        addComponent(new Label("Show rows:"));
        addComponent(b5 = new Button("5", e -> select(5)));
        b5.addStyleName(ValoTheme.BUTTON_QUIET);
        addComponent(b10 = new Button("10", e -> select(10)));
        b10.addStyleName(ValoTheme.BUTTON_QUIET);
        addComponent(b20 = new Button("20", e -> select(20)));
        b20.addStyleName(ValoTheme.BUTTON_QUIET);
        addComponent(b40 = new Button("40", e -> select(40)));
        b40.addStyleName(ValoTheme.BUTTON_QUIET);
        select(5);
    }

    private void select(int rows) {
        grid.setHeightByRows(rows);
        b5.removeStyleName(CSS.BOLDER);
        b10.removeStyleName(CSS.BOLDER);
        b20.removeStyleName(CSS.BOLDER);
        b40.removeStyleName(CSS.BOLDER);
        Button b = null;
        if (rows == 5) b = b5;
        if (rows == 10) b = b10;
        if (rows == 20) b = b20;
        if (rows == 40) b = b40;
        if (b != null) b.addStyleName(CSS.BOLDER);
    }
}
