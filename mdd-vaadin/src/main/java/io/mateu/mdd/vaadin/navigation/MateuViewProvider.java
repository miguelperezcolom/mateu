package io.mateu.mdd.vaadin.navigation;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewProvider;
import com.vaadin.server.Page;
import com.vaadin.ui.Component;
import com.vaadin.ui.UI;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.views.BrokenLinkView;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

public class MateuViewProvider implements ViewProvider {
    private final ViewStack stack;
    private final App app;
    private String lastState;
    private View lastView;
    private int firstViewInWindow;
    private EditorViewComponent currentEditor;

    public MateuViewProvider(ViewStack stack) {
        this.stack = stack;
        app = MDDUIAccessor.getApp();
    }

    public void setLastView(View lastView) {
        this.lastView = lastView;
        lastState = stack.getState(stack.getLast());
    }

    public View getLastView() {
        return lastView;
    }

    @Override
    public String getViewName(String s) {
        return s;
    }

    public App getApp() {
        return app;
    }

    public int getFirstViewInWindow() {
        return firstViewInWindow;
    }

    public void setFirstViewInWindow(int firstViewInWindow) {
        this.firstViewInWindow = firstViewInWindow;
    }

    @Override
    public View getView(String path) {

        path = sanitizePath(path);


        // check private/public
        boolean privada = checkPrivate(path);

        // way out if private and not authenticated
        if (app.getDefaultPublicArea() == null && privada) {
            Page.getCurrent().setLocation( MDDUIAccessor.getUiRootPath() + "/private");
            return null;
        }


        // check if we are repeating the last call
        if (path.equals(lastState)) {
            return lastView;
        }

        // will save the view in stack
        new PathProcessor(this, path, privada).processPath();


        // la vista a mostrar es la última del stack
        io.mateu.mdd.vaadin.navigation.View view = stack.getLast();


        // cerrar las ventanas si es necesario (si hemos retrocedido más allá de la primera ventana abierta)
        closeWindowsIfNeeded();


        // si no hay vista es que no reconocemos el path (broken link)
        if (view == null) view = new BrokenLinkView(stack);


        // construimos el componente si hace falta
        Component c = ((io.mateu.mdd.vaadin.navigation.View) view).getViewComponent();
        if (c != null && c instanceof AbstractViewComponent) {
            ((AbstractViewComponent)c).buildIfNeeded();
        }


        // si estamos volviendo atrás y está marcado, recargar el modelo si es un editor
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


        // actualizar el título de la página
        if (c != null && c instanceof AbstractViewComponent) {
            ((AbstractViewComponent)c).updatePageTitle();
        }


        // si es un listado, limpiamos la selección
        if (c != null && c instanceof ListViewComponent) { // limpiamos selección
            if (((ListViewComponent)c).resultsComponent != null) {
                ((ListViewComponent)c).resultsComponent.getGrid().getSelectionModel().deselectAll();
            }
        }


        // si es un editor, puede ser la primera ventana abierta
        if (c != null && (c instanceof EditorViewComponent)) {
            currentEditor = (EditorViewComponent) c;
            if (false && firstViewInWindow == 0) firstViewInWindow = stack.size() + 1;
        }


        lastState = path;
        lastView = view;


        // abrir en ventana si hace falta
        if (view != null && openInWindow(view) && MateuUI.get() != null) {
            view.setOpenNewWindow(true);
            MateuUI.get().openInWindow(view);
            if (view != null && view.getViewComponent() != null && view.getViewComponent() instanceof EditorViewComponent
                    && ((EditorViewComponent)view.getViewComponent()).getBeforeOpen() != null) {
                ((EditorViewComponent)view.getViewComponent()).getBeforeOpen().run();
            }
            // devolvemos null para que no aparezca en la url del navegador
            return null;
        } else {

            // si es un editor, ejecutar el beforeOpen
            if (view != null && view.getViewComponent() != null && view.getViewComponent() instanceof EditorViewComponent
                    && ((EditorViewComponent)view.getViewComponent()).getBeforeOpen() != null) {
                ((EditorViewComponent)view.getViewComponent()).getBeforeOpen().run();
            }

            // actualizar el título de la página en el navegador
            if (view != null && view.getViewComponent() != null) {
                if (UI.getCurrent() != null && view.getViewComponent().getPageTitle() != null)
                    UI.getCurrent().getPage().setTitle((view.getViewComponent().getPageTitle() != null)?
                            view.getViewComponent().getPageTitle():
                            "No title");
            }

            // devolver la vista o null si está abierta en una ventana
            return view != null && view.getWindowContainer() == null?view:null;
        }
    }

    private void closeWindowsIfNeeded() {
        if (firstViewInWindow > 0 && stack.size() < firstViewInWindow) {
            firstViewInWindow = 0;
            UI.getCurrent().getWindows().forEach(w -> {
                w.setData("noback");
                w.close();
            });
        }
    }

    private boolean checkPrivate(String path) {
        boolean privada = false;
        if (path.equals("/") || path.startsWith("/public")) {
            privada = app.isAuthenticationNeeded();
        } else if (path.startsWith("/private")) {
            privada = true;
        }
        return privada;
    }

    private String sanitizePath(String path) {
        String sanitizedPath = path;
        String appPrefix = MDDUIAccessor.getUiRootPath();
        if (!"".equals(appPrefix)) {
            if (appPrefix.startsWith("/")) appPrefix = appPrefix.substring(1);
            if (!appPrefix.endsWith("/")) appPrefix += "/";
        }
        if (sanitizedPath.startsWith(appPrefix)) sanitizedPath = sanitizedPath.substring(appPrefix.length());
        if (!sanitizedPath.startsWith("/")) sanitizedPath = "/" + sanitizedPath;
        return sanitizedPath;
    }

    private boolean openInWindow(io.mateu.mdd.vaadin.navigation.View v) {
        if ("Form submitted".equals(v.getViewComponent().getTitle())) return false;

        return firstViewInWindow > 0 && stack.size() >= firstViewInWindow;
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

    public String getLastState() {
        return lastState;
    }
}
