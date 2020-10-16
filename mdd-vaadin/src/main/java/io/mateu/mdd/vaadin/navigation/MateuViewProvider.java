package io.mateu.mdd.vaadin.navigation;

import com.google.common.base.Strings;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewProvider;
import com.vaadin.ui.Component;
import com.vaadin.ui.UI;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.firstLevel.HomeController;
import io.mateu.mdd.vaadin.controllers.secondLevel.EditorController;
import io.mateu.mdd.vaadin.controllers.secondLevel.WizardController;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

public class MateuViewProvider implements ViewProvider {
    private final ViewStack stack;
    private String lastState;
    private View lastView;
    private int firstViewInWindow;
    private EditorViewComponent currentEditor;

    public MateuViewProvider(ViewStack stack) {
        this.stack = stack;
    }

    public void setLastView(View lastView) {
        this.lastView = lastView;
        lastState = stack.getState(stack.getLast());
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


        currentEditor = null;

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

        if (Strings.isNullOrEmpty(aux)) {
            stack.clear();
        }

        App app = MDDUIAccessor.getApp();

        if ( v != null) {
            controller = v.getController();
            v = null;
        } else {
            controller = WizardPage.class.isAssignableFrom(app.getBean().getClass())?new WizardController(stack, "", (WizardPage) app.getBean()) :app.isForm()?new EditorController(stack, "", app.getBean()):new HomeController(stack);
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
            v = stack.getLast();
        }

        if (firstViewInWindow > 0 && stack.size() < firstViewInWindow) {
            firstViewInWindow = 0;
            UI.getCurrent().getWindows().forEach(w -> {
                w.setData("noback");
                w.close();
            });
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
        if (c != null && (c instanceof EditorViewComponent)) {
            currentEditor = (EditorViewComponent) c;
            if (firstViewInWindow == 0) firstViewInWindow = stack.size() + 1;
        }


        lastState = s;
        lastView = v;

        if (v != null && firstViewInWindow > 0 && stack.size() >= firstViewInWindow && MateuUI.get() != null) {
            v.setOpenNewWindow(true);
            MateuUI.get().openInWindow(v);
            if (v != null && v.getViewComponent() != null && v.getViewComponent() instanceof EditorViewComponent && ((EditorViewComponent)v.getViewComponent()).getBeforeOpen() != null) {
                ((EditorViewComponent)v.getViewComponent()).getBeforeOpen().run();
            }
            return null; //stack.getLastNavigable();
        } else {
            if (v != null && v.getViewComponent() != null && v.getViewComponent() instanceof EditorViewComponent && ((EditorViewComponent)v.getViewComponent()).getBeforeOpen() != null) {
                ((EditorViewComponent)v.getViewComponent()).getBeforeOpen().run();
            }

            if (v != null && v.getViewComponent() != null) {
                if (UI.getCurrent() != null && v.getViewComponent().getPageTitle() != null) UI.getCurrent().getPage().setTitle((v.getViewComponent().getPageTitle() != null)?v.getViewComponent().getPageTitle():"No title");
            }

            return v != null && v.getWindowContainer() == null?v:null;
        }
    }

    public ViewStack getStack() {
        return stack;
    }

    public EditorViewComponent getCurrentEditor() {
        return currentEditor;
    }

    public void setCurrentEditor(EditorViewComponent currentEditor) {
        this.currentEditor = currentEditor;
    }
}
