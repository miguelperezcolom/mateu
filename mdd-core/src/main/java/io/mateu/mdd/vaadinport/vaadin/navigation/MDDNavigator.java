package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.google.common.base.Strings;
import com.vaadin.navigator.Navigator;
import com.vaadin.navigator.ViewProvider;
import com.vaadin.server.Page;
import com.vaadin.ui.Component;
import com.vaadin.ui.Window;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.AppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.desktop.DesktopAppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.AreaComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.MenuFlowComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.ModuleComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorListener;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.OwnedCollectionComponent;

import javax.persistence.Entity;
import java.lang.reflect.Method;
import java.util.Base64;
import java.util.Set;

public class MDDNavigator {

    private final Navigator navigator;
    private final ViewStack stack;
    private final MDDViewProvider viewProvider;


    public MDDNavigator(ViewStack stack, Navigator navigator, MDDViewProvider viewProvider) {
        this.stack = stack;
        this.navigator = navigator;
        this.viewProvider = viewProvider;
        navigator.setErrorProvider(new ViewProvider() {
            @Override
            public String getViewName(String s) {
                viewProvider.getView(s);
                return viewProvider.getStack().getState(viewProvider.getStack().getLastNavigable());
            }

            @Override
            public com.vaadin.navigator.View getView(String s) {
                return viewProvider.getStack().get(s);
            }


        });
    }


    public ViewStack getStack() {
        return stack;
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








    public void setPendingResult(Object pendingResult) {
        viewProvider.pendingResult = pendingResult;
    }






    public void go(String relativePath) {
        String path = MDDUI.get().getNavegador().getViewProvider().getCurrentPath(); //stack.getState(stack.getLast());
        if (!path.endsWith("/")) path += "/";
        path += relativePath;
        if (path != null) {
            com.vaadin.navigator.View v = viewProvider.getView(path);
            if (v != null) {
                navigator.navigateTo(path);
            }
        }
    }


    public void goTo(String path) {
        goTo(path, false);
    }

    public void goTo(String path, boolean newTab) {
        if (path != null) {
            com.vaadin.navigator.View v = viewProvider.getView(path);
            if (v != null) {
                if (newTab) {
                    //Ui.getcurrent.open(new external resources(https://www.youtube.com/),"_blank",false)
                    if (!path.startsWith("/")) path = "/app/" + path;
                    else path = "/app" + path;
                    Page.getCurrent().open(path, "_blank", false);
                } else navigator.navigateTo(path);
            }
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
        goTo(e, false);
    }

    public void goTo(MenuEntry e, boolean newTab) {
        goTo(getPath(e), newTab);
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
        viewProvider.lastMethodCall = m;
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

    public void showResult(String currentState, Method m, Object r, MDDExecutionContext context, boolean addStep, Component lastViewComponent) throws Exception {

        if (addStep) {
            if (!currentState.endsWith("/")) currentState += "/";
            currentState += "result";
        }

        goTo(currentState);
    }


    public void goBack() {
        if (!(stack.getLast().getComponent() instanceof OwnedCollectionComponent) && stack.getLast().getComponent() instanceof EditorViewComponent && ((PersistentPOJO.class.isAssignableFrom(((EditorViewComponent)stack.getLast().getComponent()).getModelType()) || ((EditorViewComponent)stack.getLast().getComponent()).getModelType().isAnnotationPresent(Entity.class)) && ((EditorViewComponent)stack.getLast().getComponent()).isModificado())) {
            MDD.saveOrDiscard("There are unsaved changes. Are you sure you want to exit?", (EditorViewComponent) stack.getLast().getComponent(), () -> yesGoBack());
        } else {
            yesGoBack();
        }
    }

    private void yesGoBack() {

        View l = stack.getLast();
        if (l.getComponent() instanceof EditorViewComponent) {
            Object result = ((EditorViewComponent)l.getComponent()).getModel();
            if (result != null && result instanceof EditorListener) ((EditorListener) result).onGoBack(result);
            ((EditorViewComponent) l.getComponent()).onGoBack();
        }

        if (stack.size() > 1) {
            View v = stack.get(stack.size() - 2);
            String u = stack.getState(v);
            if (v.getViewComponent() instanceof ListViewComponent) u = ((ListViewComponent) v.getViewComponent()).getUrl();
            if (l.getWindowContainer() != null && !l.getWindowContainer().equals(v.getWindowContainer())) {
                l.getWindowContainer().setData("noback");
                l.getWindowContainer().close();
                stack.pop();
                viewProvider.setCurrentPath(stack.size() > 0?stack.getState(stack.getLast()):null);
            } else MDDUI.get().getNavegador().goTo(u);
        } else {
            String u = stack.getState(l);
            if (!Strings.isNullOrEmpty(u) && u.contains("/")) {
                u = u.substring(0, u.lastIndexOf("/"));

                if (!MDD.isMobile() && esMenu(u)) while (esMenu(u.substring(0, u.lastIndexOf("/")))) {
                    u = u.substring(0, u.lastIndexOf("/"));
                }

                if (MDD.isMobile()) {
                    if (esInutil(u)) while (esInutil(u)) {
                        u = u.substring(0, u.lastIndexOf("/"));
                    }
                }

                MDDUI.get().getNavegador().goTo(u);
            } else {

                AppComponent appComponent = MDDUI.get().getAppComponent();
                if (appComponent instanceof DesktopAppComponent) {
                    DesktopAppComponent dac = (DesktopAppComponent) appComponent;
                    dac.maximizeLeftSide();
                }
            }
        }
    }

    public void goSibling(Object id) {
        if (stack.getLast().getComponent() instanceof EditorViewComponent && ((PersistentPOJO.class.isAssignableFrom(((EditorViewComponent)stack.getLast().getComponent()).getModelType()) || ((EditorViewComponent)stack.getLast().getComponent()).getModelType().isAnnotationPresent(Entity.class)) && ((EditorViewComponent)stack.getLast().getComponent()).isModificado())) {
            MDD.saveOrDiscard("There are unsaved changes. Do you want to save before?", (EditorViewComponent) stack.getLast().getComponent(), () -> {
                try {
                    yesGoSibling(id);
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            });
        } else {
            yesGoSibling(id);
        }
    }

    private void yesGoSibling(Object id) {

        if (stack.getLast().getComponent() instanceof EditorViewComponent) {
            EditorViewComponent ed = (EditorViewComponent) stack.getLast().getComponent();
            ed.onGoBack();
            getViewProvider().pendingFocusedSectionId = ed.getFocusedSectionId();
        }

        String u = stack.getState(stack.getLast());
        u = u.substring(0, u.lastIndexOf("/"));

        if (!MDD.isMobile() && esMenu(u)) while (esMenu(u.substring(0, u.lastIndexOf("/")))) {
            u = u.substring(0, u.lastIndexOf("/"));
        }

        if (MDD.isMobile()) {
            if (esInutil(u)) while (esInutil(u)) {
                u = u.substring(0, u.lastIndexOf("/"));
            }
        }

        u += "/" + id;

        MDDUI.get().getNavegador().goTo(u);
    }

    private boolean esInutil(String u) {
        if (!Strings.isNullOrEmpty(u)) {
            View v = stack.get(u);
            if (v != null) {
                Component c = v.getComponent();
                if (c instanceof ModuleComponent) {
                    return MDD.getApp().getArea(((ModuleComponent)c).getModule()).getModules().size() <= 1;
                }
                if (c instanceof AreaComponent) {
                    return MDD.getApp().getAreas().size() <= 1;
                }
            }
        }
        return false;
    }

    private boolean esMenu(String u) {
        if (!Strings.isNullOrEmpty(u)) {
            View v = stack.get(u);
            if (v != null) {
                Component c = v.getComponent();
                if (c instanceof MenuFlowComponent) {
                    return true;
                }
            }
        }
        return false;
    }

    public void openNewTab() {

        Page.getCurrent().open(Page.getCurrent().getLocation().toString(), "_blank");

    }

    public void edit(Object o) {
        if (o != null) {
            String state = stack.size() > 0?stack.getState(stack.getLast()):"";
            state += "/" + getObjectUrl(o);
            goTo(state);
        }
    }

    public static String getObjectUrl(Object o) {
        String u = "obj___" + Base64.getEncoder().encodeToString((o.getClass().getName() + "#" + ReflectionHelper.getId(o)).getBytes());
        return u;
    }

    public void doAfterCheckSaved(Runnable r) {
        if (stack.size() > 0 && stack.getLast().getComponent() instanceof EditorViewComponent && ((PersistentPOJO.class.isAssignableFrom(((EditorViewComponent)stack.getLast().getComponent()).getModelType()) || ((EditorViewComponent)stack.getLast().getComponent()).getModelType().isAnnotationPresent(Entity.class)) && ((EditorViewComponent)stack.getLast().getComponent()).isModificado())) {
            MDD.confirm("There are unsaved changes. Are you sure you want to exit?", () -> r.run());
        } else {
            r.run();
        }
    }
}
