package io.mateu.mdd.vaadin.navigation;

import com.vaadin.ui.Component;
import com.vaadin.ui.Window;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.controllers.Controller;

import java.util.Objects;
import java.util.UUID;

public class View implements com.vaadin.navigator.View {

    private String uuid = UUID.randomUUID().toString();
    private Controller controller;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        View view = (View) o;
        return uuid.equals(view.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(uuid);
    }

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

    public Controller getController() {
        return controller;
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




    private AbstractViewComponent wrapComponent(String title, Component component) {
        return new ComponentWrapper(title, component);
    }




    public void updateViewTitle(String newTitle, String subtitle) {
        viewComponent.updateViewTitle(newTitle, subtitle);
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

    public void setController(Controller c) {
        this.controller = c;
    }
}
