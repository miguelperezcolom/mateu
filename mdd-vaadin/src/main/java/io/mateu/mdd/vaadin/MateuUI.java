package io.mateu.mdd.vaadin;

import com.google.common.base.Strings;
import com.vaadin.navigator.Navigator;
import com.vaadin.server.Page;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinServletRequest;
import com.vaadin.ui.*;
import elemental.json.JsonArray;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MateuApp;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;
import io.mateu.mdd.shared.ui.IMDDUI;
import io.mateu.mdd.vaadin.components.app.main.MainComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.AreaComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.MenuComponent;
import io.mateu.mdd.vaadin.components.fieldBuilders.AbstractFieldBuilder;
import io.mateu.mdd.vaadin.components.views.EditorListener;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.views.OwnedCollectionComponent;
import io.mateu.mdd.vaadin.controllers.MateuViewProvider;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.util.VaadinHelper;
import io.mateu.mdd.vaadin.views.BrokenLinkView;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import org.apache.commons.lang3.StringUtils;

import javax.persistence.Entity;
import java.lang.reflect.Method;
import java.util.*;
import java.util.stream.Collectors;

public class MateuUI extends UI implements IMDDUI {
    private Navigator navigator;
    private AbstractApplication app;
    private MateuViewProvider viewProvider;
    private ViewStack stack;
    private Set pendingSelection;
    private Object pendingResult;
    private String pendingFocusedSectionId;
    private MainComponent main;
    private AbstractArea area;

    List<Locale> locales = Arrays.asList(new Locale("en"),
            new Locale("es"),
            new Locale("fr"),
            new Locale("ru"),
            new Locale("ar"),
            new Locale("zh"),
            new Locale("de"),
            new Locale("it"));


    public static MateuUI get() {
        return (MateuUI) UI.getCurrent();
    }

    public MainComponent getMain() {
        return main;
    }


    public void setCurrentEditor(EditorViewComponent editor) {
        viewProvider.setCurrentEditor(editor);
    }

    public EditorViewComponent getCurrentEditor() {
        return viewProvider.getCurrentEditor();
    }

    public String getPendingFocusedSectionId() {
        return pendingFocusedSectionId;
    }

    public void setPendingFocusedSectionId(String pendingFocusedSectionId) {
        this.pendingFocusedSectionId = pendingFocusedSectionId;
    }

    @Override
    protected void init(VaadinRequest vaadinRequest) {




        JavaScript.getCurrent().addFunction("pingserver", new JavaScriptFunction() {
            @Override
            public void call(JsonArray jsonArray) {
                // esto lo hace para provocar un cambio, y que viaje de arriba para abajo al forzar una actualización de la ui
                if (getStyleName().contains("xxxxxx")) removeStyleName("xxxxxx");
                else addStyleName("xxxxxx");
            }
        });


        try {
            initApp(vaadinRequest);

            String language = resolveLocale(vaadinRequest.getHeader("Accept-Language")).getLanguage();
            System.out.println("accepted language = " + language);

            getSession().setAttribute("__language", language);

            setContent(main = new MainComponent(this));
            stack = new ViewStack();
            navigator = new Navigator(this, main.panel);
            navigator.setErrorView(new BrokenLinkView(stack));
            navigator.addProvider(viewProvider = new MateuViewProvider(stack));

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Locale resolveLocale(String acceptLanguageHeader) {
        if (StringUtils.isBlank(acceptLanguageHeader)) {
            return Locale.getDefault();
        }
        List<Locale.LanguageRange> ranges = Locale.LanguageRange.parse(acceptLanguageHeader);
        Locale locale = Locale.lookup(ranges, locales);
        return locale ;
    }

    private void initApp(VaadinRequest vaadinRequest) throws Exception {
        if (app == null) {
            Object uiFromContext = ((VaadinServletRequest) vaadinRequest).getServletContext().getAttribute((Strings.isNullOrEmpty(getUiRootPath())?"/": getUiRootPath()) + "_app");
            app = new MateuApp(uiFromContext != null?uiFromContext.getClass():Object.class);

            if (MDD.getClassPool() == null) MDD.setClassPool(ReflectionHelper.createClassPool(((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getServletContext()));

            app.buildAreaAndMenuIds();
        }
    }

    public void irA(String donde) {
        navigator.navigateTo(donde);
    }

    @Override
    public boolean isEditingNewRecord() {
        return getCurrentEditor() != null && getCurrentEditor().isNewRecord();
    }

    @Override
    public IFieldBuilder getFieldBuilder(FieldInterfaced field) {
        IFieldBuilder r = null;
        for (IFieldBuilder b : AbstractFieldBuilder.builders) if (b.isSupported(field)) {
            r = b;
            break;
        }
        return r;
    }

    @Override
    public String getBaseUrl() {
        return null;
    }

    @Override
    public void clearStack() {

    }

    @Override
    public String getPath(MenuEntry e) {
        return app.getState(e);
    }

    @Override
    public App getApp() {
        return app;
    }

    @Override
    public String getCurrentUserLogin() {
        return null;
    }

    @Override
    public UserPrincipal getCurrentUser() {
        return null;
    }

    @Override
    public Collection<FieldInterfaced> getColumnFields(Class targetType) {
        return null;
    }

    @Override
    public void updateTitle(String title) {

    }

    @Override
    public boolean isMobile() {
        return false;
    }


    @Override
    public String getCurrentState() {
        return navigator.getCurrentNavigationState();
    }

    @Override
    public void go(String relativePath) {
        String path = stack.getState(stack.getLast()); //navigator.getCurrentNavigationState(); //stack.getState(stack.getLast());
        if (!"".equals(path) && !path.endsWith("/")) path += "/";
        path += relativePath;
        if (path != null) {
            com.vaadin.navigator.View v = viewProvider.getView(path);
            if (v != null) {
                navigator.navigateTo(path);
            }
        }
    }


    @Override
    public void goTo(String path) {
        if (path != null) {
            com.vaadin.navigator.View v = viewProvider.getView(path);
            if (v != null) {
                if (false) { // open in new tab
                    String rootPath = MDDUIAccessor.getUiRootPath();
                    //Ui.getcurrent.open(new external resources(https://www.youtube.com/),"_blank",false)
                    if (!path.startsWith("/")) path = rootPath + "/" + path;
                    else path = rootPath + path;
                    Page.getCurrent().open(path, "_blank", false);
                } else navigator.navigateTo(path);
            }
        }
    }


    @Override
    public void goBack() {
        if (stack.getLast() != null && !(stack.getLast().getComponent() instanceof OwnedCollectionComponent) && stack.getLast().getComponent() instanceof EditorViewComponent && ((PersistentPojo.class.isAssignableFrom(((EditorViewComponent)stack.getLast().getComponent()).getModelType()) || ((EditorViewComponent)stack.getLast().getComponent()).getModelType().isAnnotationPresent(Entity.class)) && ((EditorViewComponent)stack.getLast().getComponent()).isModificado()) && ((EditorViewComponent)stack.getLast().getComponent()).isCreateSaveButton()) {
            VaadinHelper.saveOrDiscard("There are unsaved changes. What do you want to do?", (EditorViewComponent) stack.getLast().getComponent(), () -> yesGoBack());
        } else {
            yesGoBack();
        }
    }



    public void yesGoBack() {

        View l = stack.getLast();

        if (stack.size() > 1) {
            View v = stack.get(stack.size() - 2);
            String u = stack.getState(v);
            if (v.getViewComponent() instanceof ListViewComponent) u = ((ListViewComponent) v.getViewComponent()).getUrl();
            if (l.getWindowContainer() != null && !l.getWindowContainer().equals(v.getWindowContainer())) {
                l.getWindowContainer().setData("noback");
                l.getWindowContainer().close();
                stack.pop();
                viewProvider.setLastView(stack.getLast());
                //viewProvider.setCurrentPath(stack.size() > 0?stack.getState(stack.getLast()):null); //todo: pendiente ver que pasa con las windows
            } else MDDUIAccessor.goTo(u);
        } else {
            String u = stack.getState(l);
            if (!Strings.isNullOrEmpty(u) && u.contains("/")) {
                u = u.substring(0, u.lastIndexOf("/"));

                if (!MDDUIAccessor.isMobile() && esMenu(u)) while (esMenu(u.substring(0, u.lastIndexOf("/")))) {
                    u = u.substring(0, u.lastIndexOf("/"));
                }

                if (MDDUIAccessor.isMobile()) {
                    if (esInutil(u)) while (esInutil(u)) {
                        u = u.substring(0, u.lastIndexOf("/"));
                    }
                }

                MDDUIAccessor.goTo(u);
            } else {
            }
        }


        if (l.getComponent() instanceof EditorViewComponent) {
            Object result = ((EditorViewComponent)l.getComponent()).getModel();
            if (result != null && result instanceof EditorListener) ((EditorListener) result).onGoBack(result);
            ((EditorViewComponent) l.getComponent()).onGoBack();
        }

    }

    public void goSibling(Object id) {
        if (stack.getLast().getComponent() instanceof EditorViewComponent && ((PersistentPojo.class.isAssignableFrom(((EditorViewComponent)stack.getLast().getComponent()).getModelType()) || ((EditorViewComponent)stack.getLast().getComponent()).getModelType().isAnnotationPresent(Entity.class)) && ((EditorViewComponent)stack.getLast().getComponent()).isModificado())) {
            VaadinHelper.saveOrDiscard("There are unsaved changes. What do you want to do?", (EditorViewComponent) stack.getLast().getComponent(), () -> {
                try {
                    yesGoSibling(id);
                } catch (Throwable throwable) {
                    Notifier.alert(throwable);
                }
            });
        } else {
            yesGoSibling(id);
        }
    }

    @Override
    public void open(Method m, Set selection) {
        setPendingSelection(selection);
        go(m.getName());
    }

    @Override
    public void open(Method m, Object result) {
        pendingResult = result;
        go(m.getName());
    }

    @Override
    public Set getPendingSelection() {
        return pendingSelection;
    }

    @Override
    public void setPendingSelection(Set selecion) {
        this.pendingSelection = selecion;
    }

    @Override
    public Object getPendingResult() {
        return pendingResult;
    }

    @Override
    public void setPendingResult(Object result) {
        this.pendingResult = result;
    }

    private void yesGoSibling(Object id) {

        EditorViewComponent ed = null;
        if (stack.getLast().getComponent() instanceof EditorViewComponent) {
            ed = (EditorViewComponent) stack.getLast().getComponent();
            ed.onGoBack();
            //getViewProvider().pendingFocusedSectionId = ed.getFocusedSectionId(); //todo: pendiente de habilitar el focusedSectionId
        }

        String u = stack.getState(stack.getLast()); //
        u = u.substring(0, u.lastIndexOf("/"));

        if (!MDDUIAccessor.isMobile() && esMenu(u)) while (esMenu(u.substring(0, u.lastIndexOf("/")))) {
            u = u.substring(0, u.lastIndexOf("/"));
        }

        if (MDDUIAccessor.isMobile()) {
            if (esInutil(u)) while (esInutil(u)) {
                u = u.substring(0, u.lastIndexOf("/"));
            }
        }

        u += "/" + id;

        if (ed != null && ed.getView().getWindowContainer() != null) {
            try {
                ed.load(id);
                //viewProvider.setCurrentPath(u); //todo: pendiente ver que pasa con las windows
                viewProvider.getStack().getViewByState().remove(viewProvider.getStack().getStateByView().get(ed.getView()));
                viewProvider.getStack().getStateByView().put(ed.getView(), u);
                viewProvider.getStack().getViewByState().put(u, ed.getView());
            } catch (Throwable throwable) {
                Notifier.alert(throwable);
            }
        }
        else MDDUIAccessor.goTo(u);
    }

    private boolean esInutil(String u) {
        if (!Strings.isNullOrEmpty(u)) {
            View v = stack.get(u);
            if (v != null) {
                Component c = v.getComponent();
                if (c instanceof AreaComponent) {
                    return MDDUIAccessor.getApp().getAreas().length <= 1;
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
                if (c instanceof MenuComponent) {
                    return true;
                }
            }
        }
        return false;
    }

    public void openInWindow(View view) {
        // lo mismo para buscar y para navegar en profundidad
        Window w = new MateuWindow(this, stack, view.getViewComponent().getCaption());

        w.addStyleName("maincomponent");

        int percent = 100 - (UI.getCurrent().getWindows().size() + 1) * 5;

        w.setWidth("" + percent + "%");
        w.setHeight("" + percent + "%");

        w.setContent(view.getViewComponent());
        view.setWindowContainer(w);

        w.center();
        w.setModal(true);


        UI.getCurrent().addWindow(w);
    }

    public void openInWindow(Component component) {
        // lo mismo para buscar y para navegar en profundidad
        Window w = new MateuWindow(this, stack, component.getCaption());

        w.addStyleName("maincomponent");

        int percent = 100 - (UI.getCurrent().getWindows().size() + 1) * 5;

        w.setWidth("" + percent + "%");
        w.setHeight("" + percent + "%");

        w.setContent(component);

        w.center();
        w.setModal(true);

        UI.getCurrent().addWindow(w);
    }

    public static void closeWindow() {
        closeWindow(true);
    }

    public static void closeWindow(boolean notifyClosingEvent) {
        if (UI.getCurrent() != null && UI.getCurrent().getWindows().size() > 0) {
            ArrayList<Window> l = new ArrayList<>(UI.getCurrent().getWindows());
            Window w = l.get(l.size() - 1);
            w.setData(notifyClosingEvent);
            w.close();
        }
    }

    public ViewStack getStack() {
        return viewProvider.getStack();
    }

    public void setArea(AbstractArea area) {
        this.area = area;
        main.getHeader().setArea(area);
    }
}
