package io.mateu.mdd.core.app;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Label;
import com.vaadin.ui.UI;
import com.vaadin.ui.Window;
import io.mateu.mdd.core.ui.MDDUIAccessor;

public class ColumnActionGroup extends ColumnAction {

    private final ColumnAction[] actions;

    public ColumnActionGroup(ColumnAction[] actions) {
        super(null, null, () -> VaadinIcons.ELLIPSIS_DOTS_V);
        this.actions = actions;
    }

    @Override
    public String toString() {
        return VaadinIcons.ELLIPSIS_DOTS_V.getHtml();
    }

    @Override
    public void run() {
        System.out.println("Hola!");
        Window w = new Window();
        w.setContent(new Label("hola!"));
        w.setVisible(true);
        UI.getCurrent().addWindow(w);
        w.setPosition(300, 500);
    }
}
