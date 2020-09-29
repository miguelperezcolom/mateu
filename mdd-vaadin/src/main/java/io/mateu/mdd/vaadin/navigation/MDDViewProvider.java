package io.mateu.mdd.vaadin.navigation;

import com.google.common.base.Strings;
import com.vaadin.data.Binder;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewProvider;
import com.vaadin.server.ExternalResource;
import com.vaadin.server.Page;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.EntityProvider;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.reflection.CoreReflectionHelper;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.app.AppComponent;
import io.mateu.mdd.vaadin.components.app.desktop.DesktopAppComponent;
import io.mateu.mdd.vaadin.components.app.views.AreaComponent;
import io.mateu.mdd.vaadin.components.app.views.*;
import io.mateu.mdd.vaadin.components.views.*;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.pojos.Profile;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.common.Pair;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Embedded;
import javax.persistence.*;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.net.URL;
import java.net.URLDecoder;
import java.time.LocalDate;
import java.util.*;


//public
//login
//private
//private|public/area
//private|public/area/modulo
//private|public/area/modulo/menu
//private|public/area/modulo/menu/menu
//private|public/area/modulo/menu/menu/accion
//private|public/area/modulo/menu/menu/accion/vista
//private|public/area/modulo/menu/menu/accion/vista/filters
//private|public/area/modulo/menu/menu/accion/vista/staticMethodName
//private|public/area/modulo/menu/menu/accion/vista/add
//private|public/area/modulo/menu/menu/accion/vista/id
//private|public/area/modulo/menu/menu/accion/vista/id|add/view/id <-- abrir registro relacionado
//private|public/area/modulo/menu/menu/accion/vista/id|add/field <-- rellenar editando lista inline
//private|public/area/modulo/menu/menu/accion/vista/id|add/field <-- rellenar seleccionado registros
//private|public/area/modulo/menu/menu/accion/vista/id|add/methodName <-- rellenar seleccionado registros

@Slf4j
public class MDDViewProvider implements ViewProvider {

    private final ViewStack stack;
    public Set pendingSelection;
    public Method lastMethodCall;
    public Object pendingResult;
    public String lastFocusedSectionId;
    public String pendingFocusedSectionId;
    private String currentPath;

    private EditorViewComponent currentEditor;
    private String pendingPrivateState;


    public void searchUp() {
        io.mateu.mdd.vaadin.navigation.View v = stack.getLast();
        if (v != null && v.getViewComponent() != null && v.getViewComponent() instanceof ListViewComponent) {
            try {
                ((ListViewComponent) v.getViewComponent()).search(((ListViewComponent) v.getViewComponent()).getModelForSearchFilters());
            } catch (Throwable throwable) {
                 Notifier.alert(throwable);
            }
        }
    }


    public void search(RpcView rpcView) {
        RpcListViewComponent x = null;
        for (io.mateu.mdd.vaadin.navigation.View v : stack.getStack()) {
            Component c = v.getComponent();
            if (c instanceof RpcListViewComponent) {
                if (((RpcListViewComponent) c).getRpcListView().equals(rpcView)) x = (RpcListViewComponent) c;
            }
        }
        if (x != null) {
            try {
                x.search(x.getModelForSearchFilters());
            } catch (Throwable throwable) {
                 Notifier.alert(throwable);
            }
        }
    }

    public String getPendingPrivateState() {
        String ps = pendingPrivateState;
        pendingPrivateState = null;
        return ps;
    }

    public String getPendingFocusedSectionId() {
        String aux = pendingFocusedSectionId;
        pendingFocusedSectionId = null;
        return aux;
    }

    public void setPendingFocusedSectionId(String pendingFocusedSectionId) {
        this.pendingFocusedSectionId = pendingFocusedSectionId;
    }

    public EditorViewComponent getCurrentEditor() {
        return currentEditor;
    }

    public void setCurrentEditor(EditorViewComponent currentEditor) {
        this.currentEditor = currentEditor;
    }

    public ViewStack getStack() {
        return stack;
    }

    public String getCurrentPath() {
        return currentPath;
    }

    public MDDViewProvider(ViewStack stack) {
        this.stack = stack;
    }

    @Override
    public String getViewName(String s) {
        //System.out.println("MDDViewProvider.getViewName(" + s + ")");
        return s;
    }

    @Override
    public View getView(String state) {

        //System.out.println("MDDViewProvider.getView(" + state + ")");

        if (MDDUI.get().getAppComponent().isSigningIn() && MDDUI.get().getCurrentUserLogin() != null) MDDUI.get().getAppComponent().setSignedIn();

        if (samePath(state, currentPath)) {
            io.mateu.mdd.vaadin.navigation.View v = stack.getLast();
            if (v != null) {
                //System.out.println("got same path (" + state + ")");
                return v;
            }
        }

        io.mateu.mdd.vaadin.navigation.View v = null;

        try {


            boolean nuevo = false;
            boolean expand = false;

            String appPrefix = MDDUI.get().getUiRootPath();
            if (!"".equals(appPrefix)) {
                if (appPrefix.startsWith("/")) appPrefix = appPrefix.substring(1);
                if (state.equals(appPrefix)) state = "";
                if (!appPrefix.endsWith("/")) appPrefix += "/";
            }
            if (state.startsWith(appPrefix)) state = state.substring(appPrefix.length());


            if (Strings.isNullOrEmpty(state)) { // caso ""

                if (!MDDUIAccessor.getApp().hasPublicContent()) {
                    if (MDDUI.get().getCurrentUserLogin() == null) state = "login";
                    else {
                        if (MDDUIAccessor.isMobile()) state = "private";
                        else state = state.split("/").length > 1?MDDUIAccessor.getApp().getState(MDDUIAccessor.getApp().getDefaultPrivateArea()):"private";
                    }
                } else {
                    if (MDDUIAccessor.isMobile()) state = "public";
                    else state = state.split("/").length > 1?MDDUIAccessor.getApp().getState(MDDUIAccessor.getApp().getDefaultPublicArea()):"public";
                    MDDUI.get().getAppComponent().setSignedIn();
                }

            }



            //System.out.println("....state=" + state);
            if ("welcome".equals(state)) {
                MDDUI.get().getAppComponent().setSignedIn();
            }

            if ("welcome".equals(state) && MDDUI.get().getCurrentUserLogin() != null) { // caso "login"
                //System.out.println("-->welcome (" + pendingPrivateState + ")");
                if (!Strings.isNullOrEmpty(pendingPrivateState)) {
                    String newState = pendingPrivateState;
                    pendingPrivateState = null;
                    if (newState.startsWith("/")) newState = newState.substring(1);

                    //System.out.println("-->going to (" + MDD.getApp().getBaseUrl() + MDDUI.get().getAdaptedUIRootPath() + newState + ")");
                    state = newState;
                    //Page.getCurrent().open(MDD.getApp().getBaseUrl() + MDDUI.get().getAdaptedUIRootPath() + newState, null);
                } else if (MDDUIAccessor.getApp().getDefaultPrivateArea() != null && MDDUIAccessor.getApp().getDefaultPrivateArea().getDefaultAction() != null) {
                    String newState = MDDUIAccessor.getApp().getMenuId(MDDUIAccessor.getApp().getDefaultPrivateArea().getDefaultAction());
                    if (!Strings.isNullOrEmpty(newState)) {
                        if (newState.startsWith("/")) newState = newState.substring(1);

                        //System.out.println("-->going to (" + MDD.getApp().getBaseUrl() + MDDUI.get().getAdaptedUIRootPath() + newState + ")");
                        state = newState;
                        //Page.getCurrent().open(MDD.getApp().getBaseUrl() + MDDUI.get().getAdaptedUIRootPath() + newState, null);
                    } else {
                        //System.out.println("-->going to (" + MDD.getApp().getBaseUrl() + MDDUI.get().getAdaptedUIRootPath() + ")");
                        //Page.getCurrent().open(MDD.getApp().getBaseUrl() + MDDUI.get().getAdaptedUIRootPath(), null);
                    }
                }
            }

            currentEditor = null;
            currentPath = state;

            if (state.startsWith("resetpassword")) {

                clearStack();

                v = new io.mateu.mdd.vaadin.navigation.View(stack, new ResetPasswordFlowComponent(state.split("/")[1]));

                MDDUI.get().getAppComponent().setResettingPassword();

            } else if ("login".equals(state)) {

                clearStack();

                stack.push(currentPath, v = new DummyView("Login", stack));
                //System.out.println("dummy view: " + state);

                MDDUI.get().getAppComponent().setSigningIn();

            } else if ("search".equals(state)) {

                UI.getCurrent().getWindows().forEach(w -> {
                    w.setData("noback");
                    w.close();
                });
                clearStack();

                v = new io.mateu.mdd.vaadin.navigation.View(stack, new SearchInMenuComponent((Searcher) MDDUIAccessor.getApp().getSearcher()) {

                    @Override
                    public void close() {

                    }
                });

                MDDUI.get().getAppComponent().setSearching();

            } else if ("bye".equals(state)) {

                pendingPrivateState = null;

                UI.getCurrent().getSession().getSession().invalidate();

                MDDUI.get().getAppComponent().unselectAll();

                clearStack();

                v = new io.mateu.mdd.vaadin.navigation.View(stack, new ByeComponent());

                MDDUI.get().getAppComponent().setArea((AbstractArea) MDDUIAccessor.getApp().getDefaultPublicArea());

                MDDUI.get().getAppComponent().setSignedOut();

            } else if ((state.startsWith("private") || state.equals("welcome") || state.equals("profile")) && MDDUI.get().getCurrentUserLogin() == null) {

                clearStack();

                pendingPrivateState = state;

                v = null;

                MDDUI.get().getAppComponent().setSigningIn();


            } else if ("welcome".equals(state)) {

                clearStack();

                MDDUI.get().getAppComponent().unselectAll();

                v = new io.mateu.mdd.vaadin.navigation.View(stack, new WelcomeComponent());

                if (MDDUIAccessor.getApp().getAreas().length == 1) {
                    AbstractArea area;
                    MDDUI.get().getAppComponent().setArea(area = (AbstractArea) MDDUIAccessor.getApp().getAreas()[0]);
                    if (area != null) {
                        AbstractAction action = area.getDefaultAction();
                        if (!MDDUIAccessor.isMobile() && action != null) {
                            new AcctionRunner().run(action);
                            if (stack.size() > 0) v = stack.getLast();
                        } else v = new io.mateu.mdd.vaadin.navigation.View(stack, new AreaComponent(area));
                        if (area != null) MDDUI.get().getAppComponent().setArea(area);
                    }
                } else MDDUI.get().getAppComponent().setArea(null);

            } else if ("public".equals(state)) {

                clearStack();
                MDDUI.get().getAppComponent().unselectAll();

                if (MDDUIAccessor.isMobile()) {
                    stack.push(currentPath, new PublicMenuFlowComponent());
                    v = stack.get(currentPath);
                } else if (MDDUIAccessor.getApp().getAreas().length == 1) {
                    AbstractArea area;
                    MDDUI.get().getAppComponent().setArea(area = (AbstractArea) MDDUIAccessor.getApp().getAreas()[0]);
                    if (area != null) {
                        AbstractAction action = area.getDefaultAction();
                        if (!MDDUIAccessor.isMobile() && action != null) {
                            new AcctionRunner().run(action);
                            if (stack.size() > 0) v = stack.getLast();
                        } else v = new io.mateu.mdd.vaadin.navigation.View(stack, new AreaComponent(area));
                        if (area != null) MDDUI.get().getAppComponent().setArea(area);
                    }
                } else {
                    v = new io.mateu.mdd.vaadin.navigation.View(stack, new PublicMenuFlowComponent());
                }

            } else if ("private".equals(state)) {

                clearStack();
                MDDUI.get().getAppComponent().unselectAll();

                if (MDDUIAccessor.isMobile()) {
                    stack.push(currentPath, new PrivateMenuFlowComponent());
                    v = stack.get(currentPath);
                } else if (MDDUIAccessor.getApp().getAreas().length == 1) {
                    AbstractArea area;
                    MDDUI.get().getAppComponent().setArea(area = (AbstractArea) MDDUIAccessor.getApp().getAreas()[0]);
                    if (area != null) {
                        AbstractAction action = area.getDefaultAction();
                        if (!MDDUIAccessor.isMobile() && action != null) {
                            new AcctionRunner().run(action);
                            if (stack.size() > 0) v = stack.getLast();
                        } else v = new io.mateu.mdd.vaadin.navigation.View(stack, new AreaComponent(area));
                        if (area != null) MDDUI.get().getAppComponent().setArea(area);
                    }
                } else {
                    v = new io.mateu.mdd.vaadin.navigation.View(stack, new PrivateMenuFlowComponent());
                }

            } else if (state.split("/").length == 2 && !"private/profile".equals(state)) { // es una area

                AbstractArea area = (AbstractArea) MDDUIAccessor.getApp().getArea(state);

                clearStack();

                if (area != null) {
                    AbstractAction action = area.getDefaultAction();
                    if (!MDDUIAccessor.isMobile() && action != null) {
                        new AcctionRunner().run(action);
                        if (stack.size() > 0) v = stack.getLast();
                    } else if (MDDUIAccessor.isMobile()) {
                        String[] ts = currentPath.split("/");
                        AbstractViewComponent xmfc = ("private".equals(ts[0])) ? new PrivateMenuFlowComponent() : new PublicMenuFlowComponent();
                        stack.push(ts[0], xmfc);
                        stack.push(currentPath, MDDUIAccessor.getApp().getAreas().length > 1?new AreaComponent(area):xmfc);
                        v = stack.get(currentPath);
                    } else v = new io.mateu.mdd.vaadin.navigation.View(stack, new AreaComponent(area));
                }

                if (area != null) MDDUI.get().getAppComponent().setArea(area);

            } else { // cualquier otro caso

                Pair<AbstractArea, MenuEntry> coordinates = getCoordinates(state);

                if (!state.startsWith("private/profile") && !"welcome".equals(state)) MDDUI.get().getAppComponent().setCoordinates(coordinates);



                v = stack.get(cleanState(state));

                if (v != null) {

                    //System.out.println("v = stack.get(cleanState(" + state + ")); != null");
                    stack.popTo(stack.indexOf(v));

                } else {

                    String[] steps = state.split("/");

                    String path = "";

                    int lastIndexInStack = -1; // nos dice hasta que posición del mobile podemos mantener
                    boolean coincide = true;
                    io.mateu.mdd.vaadin.navigation.View lastView = null;
                    int pos = 0;
                    String auxPath = path;
                    String lastPath = "";
                    int lastPos = 0;
                    boolean menuPassed = false;

                    if (state.startsWith("private/profile")) {

                        currentPath = lastPath = auxPath = "private/profile";

                        v = lastView = stack.get("private/profile");

                        if (v == null) {

                            if (!MDDUIAccessor.isMobile()) clearStack();
                            openEditor(null, Profile.class, MDDUIAccessor.getCurrentUserLogin());

                            v = lastView = stack.get("private/profile");

                        }


                        lastIndexInStack = 0;

                        lastPos = pos = 2;

                        menuPassed = true;

                    } else {
                        // va hacia atrás buscando coincidencias en el stack

                        path = state;
                        lastPath = path;
                        v = stack.get(path);
                        coincide = v != null;
                        pos = path.split("/").length;

                        while (pos > 1 && !coincide) {
                            auxPath = lastPath = path = path.substring(0, path.lastIndexOf("/"));
                            v = stack.get(path);
                            coincide = v != null;
                            pos = path.split("/").length;
                            if (v != null) {
                                lastIndexInStack = stack.indexOf(v);
                                lastView = v;
                            }
                        }
                        auxPath = lastPath;
                        menuPassed = MDDUIAccessor.getApp().getMenu(auxPath) != null;

                        int auxpos = pos;
                        String lp = lastPath;
                        while (auxpos > 1 && !menuPassed && lp.contains("/")) {
                            lp = lp.substring(0, lp.lastIndexOf("/"));
                            menuPassed = MDDUIAccessor.getApp().getMenu(lp) != null;
                        }

                        lastPos = pos;
                        coincide = true;
                    }




                    // va avanzando en los steps mientra exista en el stack
                    //System.out.println("coincide=" + coincide + ", pos = " + pos + ", steps.length = " + steps.length);

                    while (coincide && pos < steps.length) {
                        lastPath = auxPath;
                        lastPos = pos;

                        //System.out.println("coincide=" + coincide + ", pos = " + pos + ", steps.length = " + steps.length + " pastPath = " + lastPath);

                        String fullStep = steps[pos];
                        String cleanStep = cleanStep(fullStep);
                        String queryStep = queryFromStep(fullStep);

                        if (!"".equals(auxPath)) auxPath += "/";
                        auxPath += cleanStep;

                        if (MDDUIAccessor.isMobile()) {
                            menuPassed = menuPassed || (MDDUIAccessor.getApp().getMenu(auxPath) != null && MDDUIAccessor.getApp().getMenu(auxPath) instanceof AbstractAction);
                            coincide = stack.get(auxPath) != null;

                            if (coincide) {
                                path = auxPath;
                                io.mateu.mdd.vaadin.navigation.View auxV = stack.get(auxPath);
                                lastIndexInStack = stack.indexOf(auxV);
                                lastView = auxV;
                            }

                        } else {

                            menuPassed = menuPassed || MDDUIAccessor.getApp().getMenu(auxPath) != null;


                            if (menuPassed) {
                                //coincide = auxV != null || (!MDDUIAccessor.isMobile() && (MDD.getApp().getMenu(auxPath) != null && !(MDD.getApp().getMenu(auxPath) instanceof AbstractAction)));
                                coincide = stack.get(auxPath) != null;

                                if (coincide) {
                                    path = auxPath;
                                    io.mateu.mdd.vaadin.navigation.View auxV = stack.get(auxPath);
                                    lastIndexInStack = stack.indexOf(auxV);
                                    lastView = auxV;
                                }

                            }

                        }

                        pos++;
                    }


                    if (lastIndexInStack < stack.size() - 1) stack.popTo(lastIndexInStack);

                    // aquí el stack está limpio hasta el último contenido que coincide

                    // vamos creando el stack hasta que terminemos los steps

                    int currentStepIndex = lastPos;
                    currentPath = lastPath;
                    nuevo = false;
                    while (currentStepIndex < steps.length) { //vamos completando

                        nuevo = true;

                        String fullStep = steps[currentStepIndex];
                        String cleanStep = cleanStep(fullStep);
                        String queryStep = queryFromStep(fullStep);

                        currentPath = ((Strings.isNullOrEmpty(currentPath))?"":currentPath + "/") + cleanStep;


                        boolean procesar = menuPassed && MDDUIAccessor.getApp().getMenu(currentPath) == null && MDDUIAccessor.getApp().getModule(currentPath) == null && lastView != null;

                        //System.out.println("procesar=" + procesar);

                        if (procesar) {
                            // miramos el último componente añadido

                            Component lastViewComponent = lastView.getComponent();

                            if (cleanStep.startsWith("obj___")) {

                                procesarObj(cleanStep);

                            } else if (pendingResult != null) {

                                try {
                                    procesarResultado(lastMethodCall, pendingResult, lastViewComponent);
                                    lastMethodCall = null;
                                    pendingResult = null;
                                } catch (InvocationTargetException e) {
                                    e.printStackTrace();
                                } catch (NoSuchMethodException e) {
                                    e.printStackTrace();
                                } catch (InstantiationException e) {
                                    e.printStackTrace();
                                } catch (IllegalAccessException e) {
                                    e.printStackTrace();
                                }

                            } else if (lastViewComponent instanceof JPACollectionFieldListViewComponent && "add".equals(cleanStep)) {

                                procesarAdd(cleanStep, (JPACollectionFieldListViewComponent) lastViewComponent);

                            } else if (lastViewComponent instanceof ListViewComponent) { // el último fué una listView, estamos en un id, add, o en los filtros

                                procesarListViewComponent(state, cleanStep, (ListViewComponent) lastViewComponent);

                            } else if (IEditorViewComponent.class.isAssignableFrom(lastViewComponent.getClass())) {
                                //lastViewComponent instanceof EditorViewComponent ||
                                // lastViewComponent instanceof FieldEditorComponent || xxxxxxxxxxxxxxxxxxxx
                                // lastViewComponent instanceof MethodResultViewComponent ||
                                // lastViewComponent instanceof WizardComponent || xxxxxxxxxxxxxxxxxxxx
                                // lastViewComponent instanceof OwnedCollectionComponent || xxxxxxxxxxxxx
                                // lastViewComponent instanceof MethodParametersViewComponent

                                procesarEditor(state, cleanStep, (IEditorViewComponent) lastViewComponent);

                            }

                        } else if (currentStepIndex == 0) {

                            if ("public".equals(cleanStep)) { // caso "login"

                                if (MDDUIAccessor.isMobile()) {
                                    stack.push(currentPath, new PublicMenuFlowComponent());
                                    v = stack.get(currentPath);
                                } else v = new io.mateu.mdd.vaadin.navigation.View(stack, new PublicMenuFlowComponent());

                            } else if ("private".equals(cleanStep)) { // caso "login"

                                if (MDDUIAccessor.isMobile()) {
                                    stack.push(currentPath, new PrivateMenuFlowComponent());
                                    v = stack.get(currentPath);
                                } else v = new io.mateu.mdd.vaadin.navigation.View(stack, new PrivateMenuFlowComponent());

                            }

                        } else if (currentStepIndex == 1) {


                            AbstractArea area = (AbstractArea) MDDUIAccessor.getApp().getArea(currentPath);

                            AbstractAction action = area.getDefaultAction();
                            if (!MDDUIAccessor.isMobile() && action != null) {
                                new AcctionRunner().run(action);
                                if (stack.size() > 0) v = stack.getLast();
                            } else if (MDDUIAccessor.isMobile()) {
                                if (MDDUIAccessor.getApp().getAreas().length > 1) stack.push(currentPath, new AreaComponent(area));
                                else stack.push(currentPath, stack.get(0));
                                v = stack.get(currentPath);
                            } else v = new io.mateu.mdd.vaadin.navigation.View(stack, new AreaComponent(area));

                            MDDUI.get().getAppComponent().setArea(area);


                        } else if (MDDUIAccessor.getApp().getModule(currentPath) != null) {

                            IModule module = MDDUIAccessor.getApp().getModule(currentPath);
                            Component c = null;
                            if (MDDUIAccessor.getApp().getArea(module).getModules().length > 1)  stack.push(currentPath, new ModuleComponent((AbstractModule) module));
                            else {
                                if (stack.size() > 1) stack.push(currentPath, stack.get(1));
                                else stack.push(currentPath, new AreaComponent((AbstractArea) MDDUIAccessor.getApp().getArea(module)));
                            }

                        } else {

                            MenuEntry e = MDDUIAccessor.getApp().getMenu(currentPath);
                            if (e != null) {
                                if (e instanceof AbstractAction) {
                                    new AcctionRunner().run((AbstractAction) e);
                                } else if (e instanceof AbstractMenu) {
                                    if (MDDUIAccessor.isMobile()) {

                                        stack.push(currentPath, new MenuFlowComponent((AbstractMenu) e));
                                    } else {
                                        if (stack.size() > 0 && stack.getLast().getViewComponent() instanceof MenuFlowComponent)
                                            stack.push(currentPath, stack.getLast());
                                        else
                                            stack.push(currentPath, new MenuFlowComponent(getRootMenu(currentPath)));
                                    }
                                }
                            }

                        }

                        currentStepIndex++;
                        v = lastView = stack.get(currentPath);

                        if (v != null) {
                            Component c = v.getViewComponent();
                            if (c != null && c instanceof AbstractViewComponent) {
                                AbstractViewComponent av = (AbstractViewComponent) c;
                                av.buildIfNeeded();
                                expand = av.expandOnOpen();

                                if (c instanceof ListViewComponent && !Strings.isNullOrEmpty(queryStep)) {
                                    ListViewComponent l = (ListViewComponent) c;
                                    try {
                                        Object m = l.getModelForSearchFilters();

                                        Base64.Decoder b64 = Base64.getDecoder();

                                        for (String t : queryStep.split("&")) {
                                            if (t.contains("=")) {
                                                String[] tt = t.split("_");
                                                String n = tt[0];
                                                String p = tt[1];
                                                p = new String(b64.decode(p), "utf-8");
                                                FieldInterfaced f = ReflectionHelper.getFieldByName(m.getClass(), n);
                                                if (f != null) {
                                                    Object pv = p;
                                                    if (!Strings.isNullOrEmpty(p)) {
                                                        if (f.getType().equals(Long.class) || f.getType().equals(long.class)) pv = Long.parseLong(p);
                                                        else if (f.getType().equals(Integer.class) || f.getType().equals(int.class)) pv = Integer.parseInt(p);
                                                        else if (f.getType().equals(Double.class) || f.getType().equals(double.class)) pv = Double.parseDouble(p);
                                                        else if (f.getType().equals(Boolean.class) || f.getType().equals(boolean.class)) pv = Boolean.parseBoolean(p);
                                                        else if (f.getType().equals(LocalDate.class)) pv = LocalDate.parse(p);
                                                        else if (f.getType().isEnum()) pv = Enum.valueOf((Class)f.getType(), p);
                                                        else if (f.getType().isAnnotationPresent(Entity.class)) {
                                                            FieldInterfaced idField = ReflectionHelper.getIdField(f.getType());
                                                            if (idField.getType().equals(Long.class) || idField.getType().equals(long.class)) pv = Long.parseLong(p);
                                                            else if (idField.getType().equals(Integer.class) || idField.getType().equals(int.class)) pv = Integer.parseInt(p);
                                                            else if (idField.getType().equals(Double.class) || idField.getType().equals(double.class)) pv = Double.parseDouble(p);
                                                            else if (idField.getType().equals(Boolean.class) || idField.getType().equals(boolean.class)) pv = Boolean.parseBoolean(p);
                                                            else if (idField.getType().equals(LocalDate.class)) pv = LocalDate.parse(p);
                                                            else if (idField.getType().isEnum()) pv = Enum.valueOf((Class)idField.getType(), p);
                                                            pv = JPAHelper.find(f.getType(), pv);
                                                        }
                                                    }
                                                    ReflectionHelper.setValue(f, m, pv);
                                                }
                                            }
                                        }

                                        l.setModelForSearchFilters(m);

                                    } catch (Throwable e) {
                                         Notifier.alert(e);
                                    }
                                }
                            }
                        }

                    }



                    // aquí

                    if (v == null) {

                        MenuEntry e = MDDUIAccessor.getApp().getMenu(currentPath);
                        if (e != null) {
                            if (e instanceof AbstractMenu) {
                                if (MDDUIAccessor.isMobile()) {
                                    stack.push(currentPath, new MobileMenuComponent(e));
                                } else {
                                    stack.push(currentPath, new MenuFlowComponent((AbstractMenu) e));
                                }
                                currentStepIndex++;
                                v = stack.get(currentPath);
                            } else if (e instanceof AbstractAction) {
                                stack.push(currentPath, new ComponentWrapper(e.getCaption(), new Label("", ContentMode.HTML)));
                                currentStepIndex++;
                                v = stack.get(currentPath);
                            }
                        } else {
                            if (currentStepIndex == 0) { // public | private --> lista de areas
                                if ("public".equalsIgnoreCase(path)) {
                                    stack.push(currentPath, new PublicMenuFlowComponent());
                                    currentStepIndex++;
                                    v = stack.get(currentPath);
                                } else if ("private".equalsIgnoreCase(path)) {
                                    stack.push(currentPath, new PrivateMenuFlowComponent());
                                    currentStepIndex++;
                                    v = stack.get(currentPath);
                                }
                            } else if (currentStepIndex == 1) {
                                // todo: fijamos el menu en esta area
                            } else {
                                // todo: fijamos el menu en esta area
                            }
                        }

                    }

                }


            }


            // aquí ya tenemos la vista, tanto si ya existía en la pila como si no, y es el último elemento de la pila

            if (v == null) {
                stack.push(currentPath, v = new BrokenLinkView(stack));
                System.out.println("broken link: " + state);
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

            if (!nuevo) {
                if (c != null && c instanceof EditorViewComponent) {
                    EditorViewComponent evc = (EditorViewComponent) c;
                    evc.updateModel(evc.getModel());
                }
            }

            if (c != null & c instanceof EditorViewComponent) {
                currentEditor = (EditorViewComponent) v.getViewComponent();
            }

            if (false && c != null & c instanceof JPAListViewComponent) {
                Notification.show(((MDDUIAccessor.isMobile())?"Click":"Double click") + " on matches to edit", Notification.Type.TRAY_NOTIFICATION);
            }

            if (c != null && c instanceof AbstractViewComponent) {
                ((AbstractViewComponent)c).updatePageTitle();
            }
            if (c == null) {
                log.debug("No limpiamos selección. c es null");
            } else if (c instanceof ListViewComponent) {
                if (((ListViewComponent)c).resultsComponent != null) {
                    log.debug("Limpiamos selección " + ((ListViewComponent)c).resultsComponent.getGrid().getSelectedItems().size());
                    ((ListViewComponent)c).resultsComponent.getGrid().getSelectionModel().deselectAll();
                    log.debug("Ha quedado en " + ((ListViewComponent)c).resultsComponent.getGrid().getSelectedItems().size());
                }
            } else {
                log.debug("No limpiamos selección. clase = " + c.getClass().getName());
            }

            expand |= stack.size() > 1;

            AppComponent appComponent = MDDUI.get().getAppComponent();
            if (appComponent instanceof DesktopAppComponent) {
                DesktopAppComponent dac = (DesktopAppComponent) appComponent;
                if (false && expand) {
                    dac.minimizeLeftSide();
//            } else if (v.isMenuExpanded()) {
                } else {
                    dac.maximizeLeftSide();
                }
            }

        } catch (Throwable e) {
             Notifier.alert(e);
        }


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

    private boolean samePath(String state, String currentPath) {
        return cleanPath(state).equals(cleanPath(currentPath));
    }

    private String cleanPath(String p) {
        String r = "";
        if (p != null) for (String s : p.split("/")) {
            if (!"".equals(r)) r += "/";
            if (!s.contains("&")) r += s;
            else r += s.substring(0, s.indexOf("&"));
        }
        return r;
    }

    public void clearStack() {
        UI.getCurrent().getWindows().forEach(w -> {
            w.setData("noback");
            w.close();
        });
        stack.clear();
    }

    private AbstractMenu getRootMenu(String currentPath) {
        AbstractMenu m = (AbstractMenu) MDDUIAccessor.getApp().getMenu(currentPath);
        MenuEntry e = MDDUIAccessor.getApp().getMenu(currentPath = currentPath.substring(0, currentPath.lastIndexOf("/")));
        while (e != null && currentPath.contains("/")) {
            if (e instanceof AbstractMenu) m = (AbstractMenu) e;
            e = MDDUIAccessor.getApp().getMenu(currentPath = currentPath.substring(0, currentPath.lastIndexOf("/")));
        }
        return m;
    }

    private String cleanState(String state) {
        String s = "";
        for (String t : state.split("/")) {
            if (!"".equals(s)) s += "/";
            s += t.contains("&")?t.substring(0, t.indexOf("&")):t;
        }
        return s;
    }

    private String queryFromStep(String fullStep) {
        if (fullStep == null || !fullStep.contains("&")) return fullStep;
        else return fullStep.substring(fullStep.indexOf("&"));
    }

    private String cleanStep(String fullStep) {
        if (fullStep == null || !fullStep.contains("&")) return fullStep;
        else return fullStep.substring(0, fullStep.indexOf("&"));
    }

    private void procesarEditor(String state, String step, IEditorViewComponent evfc) throws Throwable {
        Object r = null;
        Method method = null;
        FieldInterfaced field = null;

        if (evfc != null) {
            r = evfc.getModel();
            method = evfc.getMethod(step);
            field = evfc.getField(step);
        }
        if (r != null) {
            method = ReflectionHelper.getMethod(r.getClass(), step);
            field = ReflectionHelper.getFieldByName(r.getClass(), step.endsWith("_search") ? step.replaceAll("_search", "") : step);
        }

        if (method != null) {

            callMethod(state, method, r, (Component) evfc);

        } else if (field != null) {


            boolean ownedCollection = ReflectionHelper.isOwnedCollection(field);

            if (field.isAnnotationPresent(UseLinkToListView.class)) {

                    UseLinkToListView aa = field.getAnnotation(UseLinkToListView.class);

                    {

                        ListViewComponent lvc = null;
                        Component vc = null;

                        if (!Void.class.equals(aa.listViewClass())) {

                            vc = lvc = new RpcListViewComponent(aa.listViewClass());

                        } else {

                            if (field.isAnnotationPresent(ManyToOne.class)) {

                                vc = lvc = new JPAListViewComponent(field.getType());

                            } else {

                                vc = lvc = new JPACollectionFieldListViewComponent(field.getGenericClass(), field, evfc);

                            }


                        }

                        if (field.isAnnotationPresent(ManyToOne.class)) {

                            FieldInterfaced finalField = field;
                            lvc.addListener(new ListViewComponentListener() {
                                @Override
                                public void onEdit(Object id) {

                                }

                                @Override
                                public void onSelect(Object id) {
                                    log.debug("Han seleccionado " + id);
                                    Optional o = (Optional) id;
                                    if (o.isPresent()) {

                                        try {

                                            JPAHelper.notransact(em -> {

                                                Object m = evfc.getModel();
                                                Object oid = o.get();


                                                Object e = null;

                                                if (oid instanceof Object[]) {
                                                    e = em.find(finalField.getType(), ((Object[]) oid)[0]);
                                                } else if (oid instanceof EntityProvider) {
                                                    e = ((EntityProvider) oid).toEntity(em);
                                                } else {
                                                    e = em.find(finalField.getType(), oid);
                                                }

                                                ReflectionHelper.setValue(finalField, m, e);
                                                evfc.updateModel(m);

                                                MDDUI.get().getNavegador().goBack();

                                            });
                                        } catch (Throwable throwable) {
                                             Notifier.alert(throwable);
                                        }

                                    }
                                }
                            });

                        }

                        stack.push(currentPath, vc).setOpenNewWindow(true);

                    }
            } else if (ownedCollection) {

                stack.push(currentPath, new OwnedCollectionComponent(evfc.getBinder(), field, field.isAnnotationPresent(UseLinkToListView.class) ? -1 : 0)).setOpenNewWindow(true);

            } else if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {

                ListViewComponent lvc = null;
                Component vc = null;

                if (field.isAnnotationPresent(UseLinkToListView.class)) evfc.save(false);

                vc = new JPACollectionFieldViewComponent(field.getGenericClass(), field, evfc, false);

                stack.push(currentPath, vc).setOpenNewWindow(true);

            } else {

                MDDBinder binder = evfc.getBinder();
                if (evfc.getCreatorWindow() != null) binder = evfc.getCreatorWindow().getBinder();
                procesarFieldEditor(binder, field, step);

            }

        } else if (evfc instanceof OwnedCollectionComponent) {

            int index = Integer.parseInt(step);
            try {
                ((OwnedCollectionComponent) evfc).setIndex(index);
            } catch (Exception e) {
                 Notifier.alert(e);
            }

        }

        if (evfc != null && evfc instanceof EditorViewComponent)
            currentEditor = (EditorViewComponent) evfc;

    }

    private void procesarFieldEditor(MDDBinder parentBinder, FieldInterfaced field, String step) throws Throwable {
        if (step.endsWith("_search")) {
            stack.push(currentPath, MDDViewComponentCreator.createSearcherComponent(parentBinder, field)).setOpenNewWindow(true);
        } else if (ReflectionHelper.isBasico(field.getType())) {
            stack.push(currentPath, new FieldEditorComponent(parentBinder, field)).setOpenNewWindow(true);
        } else {
            Object o = ReflectionHelper.getValue(field, parentBinder.getBean());
            boolean add = o == null;
            EditorViewComponent evc = add?new EditorViewComponent(field.getType()):new EditorViewComponent(o);
            if (add) evc.load(null);
            if (field.isAnnotationPresent(ManyToOne.class) && field.getAnnotation(ManyToOne.class).cascade() != null) for (CascadeType c : field.getAnnotation(ManyToOne.class).cascade()) {
                if (CascadeType.ALL.equals(c) || CascadeType.MERGE.equals(c)) {
                    evc.setCreateSaveButton(false);
                    break;
                }
            }

            evc.addEditorListener(new EditorListener() {
                @Override
                public void preSave(Object model) throws Throwable {

                }

                @Override
                public void onSave(Object model) {
                    try {
                        Object m = parentBinder.getBean();
                        ReflectionHelper.setValue(field, m, model);
                        parentBinder.getBinding(field.getName()).ifPresent(b -> {
                            ((Binder.Binding)b).getField().setValue(null);
                            ((Binder.Binding)b).getField().setValue(model);
                        });
                        parentBinder.setBean(m, false);
                    } catch (Exception e) {
                         Notifier.alert(e);
                    }
                }

                @Override
                public void onGoBack(Object model) {
                    if ((field.isAnnotationPresent(Embedded.class)) || (field.getDeclaringClass().isAnnotationPresent(Entity.class) && field.isAnnotationPresent(Convert.class))) {
                        Object m = parentBinder.getBean();
                        try {
                            ReflectionHelper.setValue(field, m, model);
                            parentBinder.setBean(m, false);
                        } catch (Exception e) {
                             Notifier.alert(e);
                        }
                    }
                }
            });
            stack.push(currentPath, evc).setOpenNewWindow(true);
        }
    }

    private void procesarListViewComponent(String state, String step, ListViewComponent lvc) throws Exception {
        // step es filters, add o el id del objeto a editar

        Method method = lvc.getMethod(step);

        if (method == null && !"filters".equals(step) && lvc instanceof RpcListViewComponent) {
            if (pendingResult == null) {
                try {

                    Object o = ((RpcListViewComponent) lvc).onEdit(step);
                    if (o instanceof RpcView) o = new RpcListViewComponent((RpcView) o);
                    else if (!(o instanceof Component)) o = new EditorViewComponent(o);

                    stack.push(currentPath, (Component) o);

                } catch (Throwable e) {
                     Notifier.alert(e);
                }
            }
        } else if (method != null) {

            callMethod(state, method, lvc instanceof RpcListViewComponent ? ((RpcListViewComponent) lvc).getRpcListView() : null, lvc);

        } else if ("filters".equals(step)) {

            try {
                stack.push(currentPath, new FiltersViewFlowComponent(lvc)).setOpenNewWindow(MDDUI.get().getWindows().size() > 0);
            } catch (Exception e) {
                 Notifier.alert(e);
            }

        } else {

            if (lvc instanceof JPACollectionFieldListViewComponent) {

                JPACollectionFieldListViewComponent cflvc = (JPACollectionFieldListViewComponent) lvc;

                Class targetType = cflvc.getModelType();
                if (pendingResult != null) targetType = pendingResult.getClass();
                Object parent = cflvc.getEvfc().getModel();

                FieldInterfaced mf = ReflectionHelper.getMapper(cflvc.getField());

                List<FieldInterfaced> parentFields = ReflectionHelper.getAllFields(parent.getClass());

                List<FieldInterfaced> hiddenFields = new ArrayList<>();

                for (FieldInterfaced f : ReflectionHelper.getAllEditableFields(targetType)) {

                    boolean hide = false;
                    for (FieldInterfaced pf : parentFields) {
                        if (f.equals(mf)
                                ||
                                (pf.isAnnotationPresent(ManyToOne.class) && f.isAnnotationPresent(ManyToOne.class) && pf.getType().equals(f.getType()) && pf.getName().equals(f.getName()))) {
                            hide = true;
                            break;
                        }
                    }

                    if (hide) hiddenFields.add(f);
                }

                EditorViewComponent evc = new EditorViewComponent(cflvc, cflvc.getItem(step), null, hiddenFields);

                stack.push(currentPath, evc).setOpenNewWindow(true);


            } else if (lvc instanceof CollectionListViewComponent) {

                CollectionListViewComponent cflvc = (CollectionListViewComponent) lvc;

                EditorViewComponent evc = new EditorViewComponent(cflvc, cflvc.deserializeId(step), null, null);

                stack.push(currentPath, evc).setOpenNewWindow(true);

            } else {

                EditorViewComponent evc = new EditorViewComponent(lvc, lvc.getModelType());

                evc.setBeforeOpen(() -> {
                    try {

                        if (Strings.isNullOrEmpty(step) || "new".equals(step)) { // estamos añadiendo un nuevo registro
                            evc.load(null);
                        } else { // step es el id del objeto a editar
                            String sid = URLDecoder.decode(Helper.decodeState(step), "iso-8859-1");
                            evc.load(lvc.deserializeId(sid));
                        }

                    } catch (Throwable throwable) {
                        throwable.printStackTrace();
                    }
                });

                evc.addEditorListener(new EditorListener() {
                    @Override
                    public void preSave(Object model) throws Throwable {

                    }

                    @Override
                    public void onSave(Object model) {

                    }

                    @Override
                    public void onGoBack(Object model) {
                        try {
                            lvc.search(lvc.getModelForSearchFilters());
                        } catch (Throwable throwable) {
                             Notifier.alert(throwable);
                        }
                    }
                });

                io.mateu.mdd.vaadin.navigation.View v = stack.push(currentPath, evc);
                if (lvc.getView().getWindowContainer() != null) v.setOpenNewWindow(true);

            }
        }
    }

    private void procesarAdd(String step, JPACollectionFieldListViewComponent cfcvc) {

        try {

            Class targetType = cfcvc.getModelType();
            if (pendingResult != null) targetType = pendingResult.getClass();
            Object parent = cfcvc.getEvfc().getModel();

            FieldInterfaced mf = ReflectionHelper.getMapper(cfcvc.getField());

            List<FieldInterfaced> parentFields = ReflectionHelper.getAllFields(parent.getClass());

            List<FieldInterfaced> hiddenFields = new ArrayList<>();

            for (FieldInterfaced f : ReflectionHelper.getAllEditableFields(targetType)) {

                boolean hide = false;
                for (FieldInterfaced pf : parentFields) {
                    if (f.equals(mf)
                            ||
                            (pf.isAnnotationPresent(ManyToOne.class) && f.isAnnotationPresent(ManyToOne.class) && pf.getType().equals(f.getType()) && pf.getName().equals(f.getName()))) {
                        hide = true;
                        break;
                    }
                }

                if (hide) hiddenFields.add(f);
            }

            EditorViewComponent evc = new EditorViewComponent(cfcvc, pendingResult != null ? pendingResult : cfcvc.addNew(), null, hiddenFields);

            evc.addEditorListener(new EditorListener() {
                @Override
                public void preSave(Object model) throws Throwable {
                    cfcvc.preSave(model);
                }

                @Override
                public void onSave(Object model) {
                    try {
                        cfcvc.saved(model);
                    } catch (Throwable e) {
                         Notifier.alert(e);
                    }
                }

                @Override
                public void onGoBack(Object model) {

                }
            });

            pendingResult = null;

            stack.push(currentPath, evc).setOpenNewWindow(true);

        } catch (Exception e) {
             Notifier.alert(e);
        }
    }

    private void procesarObj(String step) {
        String decoded = new String(Base64.getDecoder().decode(step.replaceFirst("obj___", "")));

        String cn = decoded.split("#")[0];
        String id = decoded.substring(cn.length() + 1);

        try {
            Object o = null;

            if (pendingResult != null) {
                o = pendingResult;
            } else {
                Class c = Class.forName(cn);
                o = JPAHelper.find(c, ReflectionHelper.toId(c, id));
            }

            if (UserPrincipal.class.isAssignableFrom(o.getClass())) throw new Exception("Users are not accesible this way!");

            EditorViewComponent evc = new EditorViewComponent(o);

            stack.push(currentPath, evc);


        } catch (Throwable e) {
             Notifier.alert(e);
        }
    }

    private List getIdsFromCollection(FieldInterfaced field, Object model) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        List l = new ArrayList();
        for (Object x : (Collection) ReflectionHelper.getValue(field, model)) l.add(ReflectionHelper.getId(x));
        if (l.size() == 0) l.add(0);
        return l;
    }

    private Pair<AbstractArea,MenuEntry> getCoordinates(String state) {

        AbstractArea area = null;
        MenuEntry menu = null;

        String[] steps = state.split("/");

        String path = "";

        int pos = 0;
        String auxPath = path;
        boolean menuPassed = false;
        while (pos < steps.length) {
            if (!"".equals(auxPath)) auxPath += "/";

            String fullStep = steps[pos];
            String cleanStep = cleanStep(fullStep);
            String queryStep = queryFromStep(fullStep);

            auxPath += cleanStep;

            if (pos == 1) area = (AbstractArea) MDDUIAccessor.getApp().getArea(auxPath);

            menuPassed = (menu = MDDUIAccessor.getApp().getMenu(auxPath)) != null;

            if (menuPassed) break;

            pos++;
        }

        return new Pair<>(area, menu);

    }


    public void alert(String s) {
         Notifier.alert(s);
    }

    public void openEditor(MDDOpenEditorAction action, Class viewClass, Object id) throws Exception {
        stack.push(currentPath, MDDViewComponentCreator.createComponent(action, viewClass, id));
    }

    public void openListView(AbstractAction action, Class viewClass) throws Exception {
        stack.push(currentPath, MDDViewComponentCreator.createComponent(action, viewClass));
    }

    public void openEditor(Object bean) throws Throwable {
        stack.push(currentPath, new EditorViewComponent(bean));
    }

    public void openCRUD(MDDOpenCRUDAction action) throws Exception {
        stack.push(currentPath, MDDViewComponentCreator.createComponent(action));
    }

    public void openWizardPage(Class firstPageClass) {
        try {
            stack.push(currentPath, MDDViewComponentCreator.createComponent((WizardPage) firstPageClass.newInstance()));
        } catch (Exception e) {
             Notifier.alert(e);
        }
    }

    public void open(AbstractAction action, Component component) throws Exception {
        stack.push(currentPath, component);
    }

    public void callMethod(String state, Method method, Object instance, Component lastViewComponent) {
        callMethod(state, method, instance, lastViewComponent, MDDUIAccessor.getApp().getMenu(state) != null);
    }

    public void callMethod(String state, Method method, Object instance, Component lastViewComponent, boolean esMenu) {
        if (method != null) {
            try {

                if (lastViewComponent instanceof JPACollectionFieldListViewComponent) {
                    instance = ((JPACollectionFieldListViewComponent) lastViewComponent).getEvfc().getModel();
                }

                if (method.isAnnotationPresent(Action.class) && method.getAnnotation(Action.class).refreshOnBack()) {
                    if (lastViewComponent != null) lastViewComponent.addStyleName("refreshOnBack");
                } else if (lastViewComponent != null && lastViewComponent instanceof ListViewComponent) {
                    if (lastViewComponent != null) lastViewComponent.addStyleName("refreshOnBack");
                }

                if (pendingResult != null) {

                    procesarResultado(method, pendingResult, lastViewComponent);

                } else {

                    boolean hasNonInjectedParameters = false;

                    for (Parameter p : method.getParameters()) if (!ReflectionHelper.isInjectable(method, p)) {
                        hasNonInjectedParameters = true;
                        break;
                    }

                    if (hasNonInjectedParameters) {
                        MethodParametersViewComponent mpvc;
                        stack.push(currentPath, mpvc = new MethodParametersViewComponent(instance, method, pendingSelection)).setOpenNewWindow(!esMenu);
                        mpvc.addEditorListener(new EditorListener() {
                            @Override
                            public void preSave(Object model) throws Throwable {

                            }

                            @Override
                            public void onSave(Object model) {

                            }

                            @Override
                            public void onGoBack(Object model) {
                                if (lastViewComponent != null && lastViewComponent instanceof ListViewComponent) {
                                    try {
                                        ((ListViewComponent) lastViewComponent).search(((ListViewComponent) lastViewComponent).getModelForSearchFilters());
                                    } catch (Throwable throwable) {
                                         Notifier.alert(throwable);
                                    }
                                }
                            }
                        });
                    } else {
                        procesarResultado(method, CoreReflectionHelper.execute(method, new MDDBinder(new ArrayList<>()), instance, pendingSelection), lastViewComponent, !esMenu);
                    }

                }

            } catch (Throwable e) {
                 Notifier.alert(e);
                lastViewComponent.removeStyleName("refreshOnBack");
            }
        }
    }

    private void procesarResultado(Method m, Object r, Component lastViewComponent) throws Throwable {
        procesarResultado(m, r, lastViewComponent, true);
    }

    private void procesarResultado(Method m, Object r, Component lastViewComponent, boolean inNewWindow) throws Throwable {
        String title = m != null?"Result of " + Helper.capitalize(m.getName()):"Result";

        if (m != null && m.isAnnotationPresent(Action.class) && m.getAnnotation(Action.class).refreshOnBack()) {
            if (lastViewComponent != null) lastViewComponent.addStyleName("refreshOnBack");
        } else if (lastViewComponent != null && lastViewComponent instanceof ListViewComponent) {
            if (lastViewComponent != null) lastViewComponent.addStyleName("refreshOnBack");
        }

        if (r == null && void.class.equals(m.getReturnType())) {
            ComponentWrapper cw;
            stack.push(currentPath, cw = new ComponentWrapper(title, new Label("Void method", ContentMode.HTML))).setOpenNewWindow(inNewWindow);
            cw.addAttachListener(e -> {
                MDDUI.get().getNavegador().goBack();
            });
        } else if (r == null) {
            stack.push(currentPath, new ComponentWrapper(title, new Label("Empty result", ContentMode.HTML))).setOpenNewWindow(inNewWindow);
        } else {
            Class c = r.getClass();

            if (r instanceof Class) {
                c = (Class) r;
                if (c.isAnnotationPresent(Entity.class)) {
                    stack.push(currentPath, new JPAListViewComponent(c)).setOpenNewWindow(inNewWindow);
                } else if (RpcView.class.isAssignableFrom(c)) {
                    r = c.getConstructor().newInstance();
                    if (m != null && m.isAnnotationPresent(Output.class)) {
                        try {
                            stack.push(currentPath, new ComponentWrapper(title, new PdfComponent((RpcView) r, r, null))).setOpenNewWindow(inNewWindow);
                        } catch (Throwable throwable) {
                             Notifier.alert(throwable);
                        }
                    } else {
                        stack.push(currentPath, new RpcListViewComponent((RpcView) r)).setOpenNewWindow(inNewWindow);
                    }
                }
            } else if (int.class.equals(c)
                    || Integer.class.equals(c)
                    || long.class.equals(c)
                    || Long.class.equals(c)
                    || double.class.equals(c)
                    || Double.class.equals(c)
                    || String.class.equals(c)
                    || boolean.class.equals(c)
                    || Boolean.class.equals(c)
                    || float.class.equals(c)
                    || Float.class.equals(c)
            ) {
                stack.push(currentPath, new ComponentWrapper(title, new Label("" + r, ContentMode.HTML))).setOpenNewWindow(inNewWindow);
            } else if (URL.class.equals(c)) {
                if (r.toString().contains("google")) {
                    Page.getCurrent().open(r.toString(), "_blank");
                } else if ((m != null && m.isAnnotationPresent(IFrame.class)) || r.toString().endsWith("pdf")) {
                    BrowserFrame b = new BrowserFrame("Result", new ExternalResource(r.toString()));
                    b.setSizeFull();
                    stack.push(currentPath, new ComponentWrapper(null, title, b, true)).setOpenNewWindow(inNewWindow);
                } else {
                    stack.push(currentPath, new ComponentWrapper(title, new Link("Click me to view the result", new ExternalResource(r.toString())))).setOpenNewWindow(inNewWindow);
                }
            } else if (r instanceof Collection && ((Collection) r).size() > 0 && ((Collection) r).iterator().next() != null && ((Collection) r).iterator().next().getClass().isAnnotationPresent(Entity.class)) {
                stack.push(currentPath, new CollectionListViewComponent((Collection) r, ((Collection) r).iterator().next().getClass())).setOpenNewWindow(inNewWindow);
            } else if (Collection.class.isAssignableFrom(c)) {

                Collection col = (Collection) r;

                if (col.size() == 0) {
                    stack.push(currentPath, new ComponentWrapper(null, title, new Label("Empty list", ContentMode.HTML), true)).setOpenNewWindow(inNewWindow);
                } else if (m != null && m.isAnnotationPresent(Pdf.class) || Query.class.isAssignableFrom(m.getReturnType())) {
                    try {
                        stack.push(currentPath, new ComponentWrapper(null, title, new PdfComponent((List) r), true)).setOpenNewWindow(inNewWindow);
                    } catch (Throwable throwable) {
                         Notifier.alert(throwable);
                    }
                } else {

                    if (MDDUIAccessor.isMobile()) {

                        VerticalLayout vl = new VerticalLayout();
                        boolean primero = true;
                        for (Object o : col) {

                            if (primero) primero = false;
                            else vl.addComponent(new Label("--------------"));

                            if (ReflectionHelper.isBasico(o)) {
                                vl.addComponent(new Label("" + o));
                            } else {
                                for (FieldInterfaced f : ReflectionHelper.getAllFields(o.getClass())) {
                                    Label l;
                                    vl.addComponent(l = new Label("" + ReflectionHelper.getCaption(f)));
                                    l.addStyleName(ValoTheme.LABEL_BOLD);
                                    l.addStyleName(CSS.NOPADDING);
                                    vl.addComponent(l = new Label("" + ReflectionHelper.getValue(f, o)));
                                    l.addStyleName(CSS.NOPADDING);
                                }
                            }

                        }

                        stack.push(currentPath, new ComponentWrapper(title, vl));

                    } else {

                        Object primerElemento = col.iterator().next();

                        Grid g = new Grid();

                        ListViewComponent.buildColumns(g, ListViewComponent.getColumnFields(primerElemento.getClass()), false, false);

                        //g.setSelectionMode(Grid.SelectionMode.MULTI);

                        // añadimos columna para que no haga feo
                        if (g.getColumns().size() == 1) ((Grid.Column)g.getColumns().get(0)).setExpandRatio(1);
                        else g.addColumn((d) -> null).setWidthUndefined().setCaption("");

                        g.setWidth("100%");
                        g.setHeightByRows(col.size());

                        g.setDataProvider(new ListDataProvider((Collection) r));

                        stack.push(currentPath, new ComponentWrapper(null, title, g, true)).setOpenNewWindow(inNewWindow);
                    }

                }


            } else if (r instanceof Query) {

                try {
                    stack.push(currentPath, new ComponentWrapper(title, new PdfComponent((Query) r))).setOpenNewWindow(inNewWindow);
                } catch (Throwable throwable) {
                     Notifier.alert(throwable);
                }

            } else if (r instanceof RpcView) {

                if (m != null && m.isAnnotationPresent(Output.class)) {
                    try {
                        stack.push(currentPath, new ComponentWrapper(title, new PdfComponent((RpcView) r, r, null))).setOpenNewWindow(inNewWindow);
                    } catch (Throwable throwable) {
                         Notifier.alert(throwable);
                    }
                } else {
                    stack.push(currentPath, new RpcListViewComponent((RpcView) r)).setOpenNewWindow(inNewWindow);
                }

            } else if (m != null && m.isAnnotationPresent(Output.class)) {

                stack.push(currentPath, new ComponentWrapper(title, new PrintPOJOComponent(r))).setOpenNewWindow(inNewWindow);

            } else if (r.getClass().isAnnotationPresent(Entity.class) || PersistentPojo.class.isAssignableFrom(r.getClass())) {
                stack.push(currentPath, new EditorViewComponent(r, lastViewComponent)).setOpenNewWindow(inNewWindow);
            } else if (r instanceof Component) {
                stack.push(currentPath, new ComponentWrapper(title, (Component) r)).setOpenNewWindow(inNewWindow);
            } else if (r instanceof AbstractAction) {
                new AcctionRunner().run((AbstractAction) r);
            } else if (r instanceof WizardPage) {
                stack.push(currentPath, new WizardComponent((WizardPage) r)).setOpenNewWindow(inNewWindow);
            } else {
                stack.push(currentPath, new EditorViewComponent(r) {
                    @Override
                    public void goBack() {
                        // no vuelve atrás
                    }
                }).setOpenNewWindow(inNewWindow);
            }

        }
        pendingResult = null;

    }


    public boolean isEditingNewRecord() {
        return currentEditor != null && currentEditor.isNewRecord();
    }

    public void setCurrentPath(String s) {
        currentPath = s;
    }
}
