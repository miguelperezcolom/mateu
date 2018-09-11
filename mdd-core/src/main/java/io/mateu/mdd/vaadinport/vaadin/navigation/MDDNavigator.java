package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.navigator.Navigator;
import com.vaadin.server.Page;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.FieldEditorComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.MethodResultViewFlowComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;

import java.lang.reflect.Method;
import java.util.Set;

public class MDDNavigator {

    private final Navigator navigator;
    private final ViewStack stack;
    private final MDDViewProvider viewProvider;


    public MDDNavigator(ViewStack stack, Navigator navigator, MDDViewProvider viewProvider) {
        this.stack = stack;
        this.navigator = navigator;
        this.viewProvider = viewProvider;
    }


    public ViewStack getStack() {
        return stack;
    }

    public Navigator getNavigator() {
        return navigator;
    }


    public MDDViewProvider getViewProvider() {
        return viewProvider;
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

    public void goTo(Method m, Set selection) {
        viewProvider.pendingSelection = selection;
        String state = stack.getState(stack.getLast());
        state += "/" + m.getName();
        goTo(state);
    }

    public void goTo(Method m, Object result) {
        viewProvider.pendingResult = result;
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

    public void showResult(String currentState, Method m, Object r, MDDExecutionContext context, boolean addStep) throws InstantiationException, IllegalAccessException {

        if (addStep) {
            if (!currentState.endsWith("/")) currentState += "/";
            currentState += "result";
        }

        if (r instanceof AbstractAction) {
            ((AbstractAction) r).run(context);
        } else stack.push(currentState, new MethodResultViewFlowComponent(currentState, m, r));

        goTo(currentState);
    }


    public void goBack() {
        if (stack.getLast().getComponent() instanceof EditorViewComponent && ((EditorViewComponent)stack.getLast().getComponent()).isModificado()) {
            MDD.confirm("There are unsaved changes. Are you sure you want to exit?", () -> yesGoBack());
        } else {
            yesGoBack();
        }
    }

    private void yesGoBack() {

        if (stack.getLast().getComponent() instanceof EditorViewComponent) {
            ((EditorViewComponent) stack.getLast().getComponent()).onGoBack();
        } else if (stack.getLast().getComponent() instanceof FieldEditorComponent) {
            EditorViewComponent editor = ((FieldEditorComponent) stack.getLast().getComponent()).getEditor();
            if (editor != null) editor.onGoBack();
        }

        String u = stack.getState(stack.getLast());
        u = u.substring(0, u.lastIndexOf("/"));

        MDDUI.get().getNavegador().goTo(u);
    }

    public void openNewTab() {

        Page.getCurrent().open(Page.getCurrent().getLocation().toString(), "_blank");

    }
}
