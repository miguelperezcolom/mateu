package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.ui.Component;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.AbstractViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.SearchInMenuComponent;

public class View implements com.vaadin.navigator.View {

    private final AbstractViewComponent viewComponent;
    private final ViewStack stack;
    private final Component component;

    public View(ViewStack stack, Component component) {
        this.stack = stack;
        this.component = component;

        if (component instanceof AbstractViewComponent) viewComponent = (AbstractViewComponent) component;
        else viewComponent = wrapComponent(null, component);


        if (component instanceof AbstractViewComponent) {
            ((AbstractViewComponent)component).setStack(stack);
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




    public boolean isMenuExpanded() {
        boolean exp = component != null && (component instanceof PrivateMenuFlowComponent || component instanceof PublicMenuFlowComponent || component instanceof AreaComponent || component instanceof ModuleComponent || component instanceof MenuFlowComponent || component instanceof SearchInMenuComponent);
        return exp;
    }





    private AbstractViewComponent wrapComponent(String title, Component component) {
        return new ComponentWrapper(title, component);
    }




    public void updateViewTitle(String newTitle) {
        viewComponent.updateViewTitle(newTitle);
    }


}
