package io.mateu.mdd.vaadin.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.controllers.VoidController;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class ComponentView extends View {

    private String title;

    @Override
    public String toString() {
        return title;
    }

    public ComponentView(ViewStack stack, String title, VaadinIcons icon, Component component) {
        super(stack, getContent(icon, title, component), new VoidController());
        this.title = title;
    }

    private static Component getContent(VaadinIcons icon, String title, Component component) {
        return new ComponentWrapper(icon, title, component, false);
    }
}
