package io.mateu.mdd.vaadin.controllers;

import com.google.common.base.Strings;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewProvider;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.controllers.firstLevel.HomeController;
import io.mateu.mdd.vaadin.views.BrokenLinkView;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

public class MateuViewProvider implements ViewProvider {
    private final ViewStack stack;
    private String lastState;
    private View lastView;

    public MateuViewProvider(ViewStack stack) {
        this.stack = stack;
    }

    @Override
    public String getViewName(String s) {
        return s;
    }

    @Override
    public View getView(String s) {

        String appPrefix = MDDUIAccessor.getUiRootPath();
        if (!"".equals(appPrefix)) {
            if (appPrefix.startsWith("/")) appPrefix = appPrefix.substring(1);
            if (!appPrefix.endsWith("/")) appPrefix += "/";
        }
        if (s.startsWith(appPrefix)) s = s.substring(appPrefix.length());
        if (!s.startsWith("/")) s = "/" + s;

        if (s.equals(lastState)) {
            return lastView;
        }


        Controller controller = null;

        //mirar si ya lo tenemos en el stack
        io.mateu.mdd.vaadin.navigation.View v = null;

        String aux = s;
        String remaining = "";
        while (!Strings.isNullOrEmpty(aux) && v == null) {
            if (stack.get(aux) != null) {
                v = (io.mateu.mdd.vaadin.navigation.View) stack.popTo(aux);
            }
            if (v == null && !Strings.isNullOrEmpty(aux) && aux.contains("/")) {
                remaining = aux.substring(aux.lastIndexOf("/")) + remaining;
                aux = aux.substring(0, aux.lastIndexOf("/"));
            }
        }

        if ( v!= null) {
            controller = v.getController();
            v = null;
        } else {
            controller = new HomeController(stack);
        }

        //clearStack();

        if (v == null) {
            try {
                if (aux.startsWith("/")) aux = aux.substring(1);
                if (remaining.startsWith("/")) remaining = remaining.substring(1);
                String step = remaining;
                remaining = "";
                if (step.contains("/")) {
                    remaining = step.substring(step.indexOf("/") + 1);
                    step = step.substring(0, step.indexOf("/"));
                }
                String cleanStep = ViewStack.cleanState(step);
                controller.apply(stack, aux, step, cleanStep, remaining);
            } catch (Throwable e) {
                Notifier.alert(e);
            }
            v = (io.mateu.mdd.vaadin.navigation.View) stack.getLastNavigable();
        }






        Component c = ((io.mateu.mdd.vaadin.navigation.View) v).getViewComponent();
        if (c != null && c instanceof AbstractViewComponent) {
            ((AbstractViewComponent)c).buildIfNeeded();
        }
        if (c.getStyleName().contains("refreshOnBack")) {

            if (c != null && c instanceof EditorViewComponent) {
                EditorViewComponent evc = (EditorViewComponent) c;
                Object id = ReflectionHelper.getId(evc.getModel());
                if (id != null) {
                    try {
                        evc.load(id);
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                } else evc.updateModel(evc.getModel());
            }
            c.removeStyleName("refreshOnBack");
        }

        /*
        if (!nuevo) {
            if (c != null && c instanceof EditorViewComponent) {
                EditorViewComponent evc = (EditorViewComponent) c;
                evc.updateModel(evc.getModel());
            }
        }

        if (c != null & c instanceof EditorViewComponent) {
            currentEditor = (EditorViewComponent) v.getViewComponent();
        }
         */

        if (c != null && c instanceof AbstractViewComponent) {
            ((AbstractViewComponent)c).updatePageTitle();
        }
        if (c != null && c instanceof ListViewComponent) { // limpiamos selección
            if (((ListViewComponent)c).resultsComponent != null) {
                ((ListViewComponent)c).resultsComponent.getGrid().getSelectionModel().deselectAll();
            }
        }


        lastState = s;
        lastView = v;



        if (v != null && v.isOpenNewWindow()) {
            MDDUI.get().openInWindow(v);
            if (v != null && v.getViewComponent() != null && v.getViewComponent() instanceof EditorViewComponent && ((EditorViewComponent)v.getViewComponent()).getBeforeOpen() != null) {
                ((EditorViewComponent)v.getViewComponent()).getBeforeOpen().run();
            }
            return null;
        } else {
            if (v != null && v.getViewComponent() != null && v.getViewComponent() instanceof EditorViewComponent && ((EditorViewComponent)v.getViewComponent()).getBeforeOpen() != null) {
                ((EditorViewComponent)v.getViewComponent()).getBeforeOpen().run();
            }
            return v != null && v.getWindowContainer() == null?v:null;
        }
    }

    public ViewStack getStack() {
        return stack;
    }
}
