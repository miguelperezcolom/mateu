package io.mateu.mdd.vaadin.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class DummyView extends View {

    @Override
    public String toString() {
        return "Page not found";
    }

    public DummyView(String title, ViewStack stack) {
        super(stack, getContent(title));
    }

    private static Component getContent(String title) {
        Label h = new Label("");
        h.addStyleName(ValoTheme.LABEL_H1);
        Label t = new Label("");
        VerticalLayout vl = new VerticalLayout(h, t);
        vl.setSizeUndefined();
        return new ComponentWrapper(VaadinIcons.BUG, title, vl, false);
    }
}
