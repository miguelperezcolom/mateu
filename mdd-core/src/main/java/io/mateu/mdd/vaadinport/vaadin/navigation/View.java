package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.ui.Component;
import com.vaadin.ui.Window;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.AbstractViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.SearchInMenuComponent;

public class View implements com.vaadin.navigator.View {

    private final AbstractViewComponent viewComponent;
    private final ViewStack stack;
    private final Component component;
    private Window windowContainer;
    private boolean openNewWindow;

    public View(ViewStack stack, Component component) {
        this.stack = stack;
        this.component = component;

        if (component instanceof AbstractViewComponent) viewComponent = (AbstractViewComponent) component;
        else viewComponent = wrapComponent(null, component);


        if (component instanceof AbstractViewComponent) {
            ((AbstractViewComponent) component).setView(this);
            ((AbstractViewComponent)component).setStack(stack);
        }

    }

    @Override
    public AbstractViewComponent getViewComponent() {
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


    public void setWindowContainer(Window w) {
        this.windowContainer = w;
        if (w != null) {
            int posx = stack.indexOf(this);
            if (posx > 0 && !w.equals(stack.get(posx - 1).getWindowContainer())) {
                viewComponent.setBackable(false);
            }
        }
    }

    public Window getWindowContainer() {
        return windowContainer;
    }

    public void setOpenNewWindow(boolean openNewWindow) {
        this.openNewWindow = openNewWindow;
    }

    public boolean isOpenNewWindow() {
        return openNewWindow;
    }
}
