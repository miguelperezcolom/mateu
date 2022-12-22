package io.mateu.mdd.vaadin.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.controllers.BrokenLinkController;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class BrokenLinkView extends View {

    @Override
    public String toString() {
        return "Page not found";
    }

    public BrokenLinkView(ViewStack stack) {
        super(stack, getContent(), new BrokenLinkController());
    }

    private static Component getContent() {
        Label h = new Label("Oops! this link is broken.");
        h.addStyleName(ValoTheme.LABEL_H1);
        Label t = new Label("We have taken note. We will look at this as soon as possible");
        VerticalLayout vl = new VerticalLayout(h, t);
        vl.setSizeUndefined();
        return new ComponentWrapper(VaadinIcons.BUG, "Broken Link", vl, false);
    }
}
