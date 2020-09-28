package io.mateu.mdd.vaadin.navigation;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;

public class ComponentView extends View {

    private String title;

    @Override
    public String toString() {
        return title;
    }

    public ComponentView(ViewStack stack, String title, VaadinIcons icon, Component component) {
        super(stack, getContent(icon, title, component));
        this.title = title;
    }

    private static Component getContent(VaadinIcons icon, String title, Component component) {
        return new ComponentWrapper(icon, title, component, false);
    }
}
