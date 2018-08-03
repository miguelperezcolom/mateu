package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.navigator.Navigator;
import com.vaadin.server.Page;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.*;

import javax.persistence.Entity;
import java.lang.reflect.Method;

public class MDDNavigator {

    private final Navigator navigator;
    private final ViewStack stack;



    public MDDNavigator(ViewStack stack, Navigator navigator) {
        this.stack = stack;
        this.navigator = navigator;
    }













    public String getPath(MenuEntry action, Class viewClass) {
        String u = MDD.getApp().getState(action);
        u += "/";
        u += viewClass.getName();
        return u;
    }

    public String getPath(MenuEntry action, Class viewClass, Object id) {
        //return getPath(action, viewClass) + "/" + ((id != null)?id:"new");
        return getPath(action) + "/" + ((id != null)?id:"new");
    }

    public String getPath(MenuEntry e) {
        return MDD.getApp().getState(e);
    }

    public String getPath(AbstractArea area) {
        return MDD.getApp().getState(area);
    }

    public String getPath(AbstractModule m) {
        return MDD.getApp().getState(m);
    }















    public void go(String relativePath) {
        String path = stack.getState(stack.getLast());
        if (!path.endsWith("/")) path += "/";
        path += relativePath;
        if (path != null) {
            navigator.navigateTo(path);
        }
    }


    public void goTo(String path) {
        if (path != null) {
            navigator.navigateTo(path);
        }
    }

    public void goTo(AbstractAction action, Class viewClass) {
        goTo(getPath(action, viewClass));
    }

    public void goTo(MenuEntry action, Class viewClass, Object id) {
        goTo(getPath(action, viewClass, id));
    }

    public void goTo(AbstractModule m) {
        goTo(getPath(m));
    }

    public void goTo(MenuEntry e) {
        goTo(getPath(e));
    }

    public void goTo(AbstractArea area) {
        goTo(getPath(area));
    }

    public void goTo(FieldInterfaced f) {
        String state = stack.getState(stack.getLast());
        state += "/" + f.getName();
        goTo(state);
    }

    public void goTo(Method m) {
        String state = stack.getState(stack.getLast());
        state += "/" + m.getName();
        goTo(state);
    }

    public void goTo(Object id) {
        String state = stack.getState(stack.getLast());
        if (!state.endsWith("/" + id)) {
            if (state.endsWith("/add")) state = state.substring(0, state.length() - "new".length());
            if (!state.endsWith("/")) state += "/";
            state += id;
        }
        goTo(state);
    }

    public void showResult(Method m, Object r, MDDExecutionContext context, boolean addStep) {

        String state = context.getCurrentState();

        if (addStep) {
            if (!state.endsWith("/")) state += "/";
            state += "result";
        }

        if (r instanceof AbstractAction) {
            ((AbstractAction) r).run(context);
        } else stack.push(state, new MethodResultViewFlowComponent(state, m, r));

        goTo(state);
    }


    public void goBack() {
        String u = stack.getState(stack.getLast());
        u = u.substring(0, u.lastIndexOf("/"));

        MyUI.get().getNavegador().goTo(u);
    }

    public void openNewTab() {

        Page.getCurrent().open(Page.getCurrent().getLocation().toString(), "_blank");

    }
}
