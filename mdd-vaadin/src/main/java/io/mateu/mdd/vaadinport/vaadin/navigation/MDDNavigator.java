package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.navigator.Navigator;
import com.vaadin.navigator.ViewChangeListener;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDAction;
import io.mateu.mdd.vaadinport.vaadin.components.app.AppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.JPAListViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.ViewComponent;

public class MDDNavigator implements ViewChangeListener {

    private final AppComponent appComponent;
    private final Navigator navigator;

    public MDDNavigator(AppComponent appComponent, Navigator navigator) {
        this.appComponent = appComponent;
        this.navigator = navigator;
    }

    public static String getPath(AbstractAction action, Class entityClass) {
        //todo: completar
        return "";
    }

    public static String getPathForEditor(AbstractAction action, Class viewClass, Object id) {
        //todo: completar
        return "";
    }

    public void goTo(String path) {
        navigator.navigateTo(path);
    }

    @Override
    public boolean beforeViewChange(ViewChangeEvent viewChangeEvent) {

        try {

            appComponent.open(getComponentForState(viewChangeEvent.getNavigator().getState()));

        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }

        return false;
    }

    private ViewComponent getComponentForState(String state) throws ClassNotFoundException {
        //todo: terminar
        return new JPAListViewComponent(Class.forName(state));
    }

    @Override
    public void afterViewChange(ViewChangeEvent event) {

    }
}
