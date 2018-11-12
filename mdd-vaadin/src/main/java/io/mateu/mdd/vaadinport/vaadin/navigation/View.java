package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.ui.Component;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.AbstractViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.AbstractViewComponent;

public class View implements com.vaadin.navigator.View {

    private final ComponentWrapper viewComponent;
    private final ViewStack stack;
    private final Component component;

    public View(ViewStack stack, Component component) {
        this.stack = stack;
        this.component = component;

        viewComponent = wrapComponent(component);


        if (component instanceof AbstractViewComponent) {
            ((AbstractViewComponent) component).setView(this);
        }

    }

    @Override
    public Component getViewComponent() {
        return viewComponent;
    }

    public Component getComponent() {
        return component;
    }

    @Override
    public String toString() {
        return viewComponent.toString();
    }










    private ComponentWrapper wrapComponent(Component component) {
        return new ComponentWrapper(stack, component);
    }




    public void updateViewTitle(String newTitle) {
        viewComponent.updateViewTitle(newTitle);
    }


}
