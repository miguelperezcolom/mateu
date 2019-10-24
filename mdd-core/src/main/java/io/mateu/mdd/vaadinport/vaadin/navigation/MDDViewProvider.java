package io.mateu.mdd.vaadinport.vaadin.navigation;

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
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.Pair;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.AppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.desktop.DesktopAppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.AreaComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.OAuthHelper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.*;
import io.mateu.mdd.vaadinport.vaadin.pojos.Profile;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import javax.persistence.Embedded;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.net.URL;
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
public class MDDViewProvider implements ViewProvider, MDDExecutionContext {

    private final ViewStack stack;
    public Set pendingSelection;
    public Method lastMethodCall;
    public Object pendingResult;
    private String currentPath;

    private EditorViewComponent currentEditor;
    private String pendingPrivateState;

    public void search(RpcView rpcView) {
        RpcListViewComponent x = null;
        for (io.mateu.mdd.vaadinport.vaadin.navigation.View v : stack.getStack()) {
            Component c = v.getComponent();
            if (c instanceof RpcListViewComponent) {
                if (((RpcListViewComponent) c).getRpcListView().equals(rpcView)) x = (RpcListViewComponent) c;
            }
        }
        if (x != null) {
            try {
                x.search(x.getModelForSearchFilters());
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        }
    }

    public String getPendingPrivateState() {
        return pendingPrivateState;
    }

    public void setPendingPrivateState(String pendingPrivateState) {
        this.pendingPrivateState = pendingPrivateState;
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
        return s;
    }

    @Override
    public View getView(String state) {
        io.mateu.mdd.vaadinport.vaadin.navigation.View v = null;
        boolean nuevo = false;

        if (state.startsWith("app/")) state = state.substring("app/".length());


        if (Strings.isNullOrEmpty(state)) { // caso ""

            if (!MDD.getApp().hasPublicContent()) {
                if (MDD.getUserData() == null) state = "login";
                else {
                    if (MDD.isMobile()) state = "private";
                    else state = state.split("/").length > 1?MDD.getApp().getState(MDD.getApp().getDefaultPrivateArea()):"private";
                }
            } else {
                if (MDD.isMobile()) state = "public";
                else state = state.split("/").length > 1?MDD.getApp().getState(MDD.getApp().getDefaultPublicArea()):"public";
            }

        }


        if ("oauth/github/callback".equalsIgnoreCase(state)) {

            //http://localhost:8080/callback?code=c0324687fdcdf68fde05

            log.debug("state = " + state);

            Map<String, String> params = Helper.parseQueryString(Page.getCurrent().getLocation().getQuery());

            if (params.containsKey("code")) {
                try {
                    MDD.setUserData(OAuthHelper.getUserDataFromGitHubCode(params.get("code")));
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
                state = "welcome";
            }

        } else if ("oauth/google/callback".equalsIgnoreCase(state)) {

            //http://localhost:8080/callback?code=c0324687fdcdf68fde05

            log.debug("state = " + state);

            Map<String, String> params = Helper.parseQueryString(Page.getCurrent().getLocation().getQuery());

            if (params.containsKey("code")) {
                try {
                    MDD.setUserData(OAuthHelper.getUserDataFromGoogleCode(params.get("code")));
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
                state = "welcome";
            }

        } else if ("oauth/microsoft/callback".equalsIgnoreCase(state)) {

            //http://localhost:8080/callback?code=c0324687fdcdf68fde05

            log.debug("state = " + state);

            Map<String, String> params = Helper.parseQueryString(Page.getCurrent().getLocation().getQuery());

            if (params.containsKey("code")) {
                try {
                    MDD.setUserData(OAuthHelper.getUserDataFromMicrosoftCode(params.get("code")));
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
                state = "welcome";
            }


        }

        if ("welcome".equals(state) && MDD.getUserData() != null) { // caso "login"
            log.debug("-->welcome (" + pendingPrivateState + ")");
            if (!Strings.isNullOrEmpty(pendingPrivateState)) {
                String newState = pendingPrivateState;
                pendingPrivateState = null;
                if (newState.startsWith("/")) newState = newState.substring(1);

                log.debug("-->going to (" + MDD.getApp().getBaseUrl() + newState + ")");

                Page.getCurrent().open(MDD.getApp().getBaseUrl() + newState, null);
            } else if (MDD.getApp().getDefaultPrivateArea().getDefaultAction() != null) {
                Page.getCurrent().open(MDD.getApp().getBaseUrl(), null);
            }
        }

        currentEditor = null;
        currentPath = state;

        if (state.startsWith("resetpassword")) {

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new ResetPasswordFlowComponent(state.split("/")[1]));

        } else if ("login".equals(state)) {

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new LoginFlowComponent());

        } else if ("search".equals(state)) {

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new SearchInMenuComponent(MDD.getApp().getSearcher()));

        } else if ("bye".equals(state)) {

            MDD.setUserData(null);

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new ByeComponent());

            MDDUI.get().getAppComponent().setArea(MDD.getApp().getDefaultPublicArea());

        } else if ((state.startsWith("private") || state.equals("welcome") || state.equals("profile")) && MDD.getUserData() == null) {

            stack.clear();

            pendingPrivateState = state;

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new LoginFlowComponent());


        } else if ("welcome".equals(state)) {

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new WelcomeComponent());

            if (MDD.getApp().getAreas().size() == 1) {

                if (MDD.getApp().getAreas().size() == 1) {
                    AbstractArea area;
                    MDDUI.get().getAppComponent().setArea(area = MDD.getApp().getAreas().get(0));
                    if (area != null) {
                        AbstractAction action = area.getDefaultAction();
                        if (!MDD.isMobile() && action != null) {
                            action.run(this);
                            if (stack.size() > 0) v = stack.getLast();
                        } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new AreaComponent(area));
                        if (area != null) MDDUI.get().getAppComponent().setArea(area);
                    }
                }

            } else MDDUI.get().getAppComponent().setArea(null);

        } else if ("public".equals(state)) {

            stack.clear();

            if (MDD.isMobile()) {
                stack.push(currentPath, new PublicMenuFlowComponent());
                v = stack.get(currentPath);
            } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PublicMenuFlowComponent());

            if (MDD.getApp().getAreas().size() == 1) {
                AbstractArea area;
                MDDUI.get().getAppComponent().setArea(area = MDD.getApp().getAreas().get(0));
                if (area != null) {
                    AbstractAction action = area.getDefaultAction();
                    if (!MDD.isMobile() && action != null) {
                        action.run(this);
                        if (stack.size() > 0) v = stack.getLast();
                    } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new AreaComponent(area));
                    if (area != null) MDDUI.get().getAppComponent().setArea(area);
                }
            }

        } else if ("private".equals(state)) {

            stack.clear();

            if (MDD.isMobile()) {
                stack.push(currentPath, new PrivateMenuFlowComponent());
                v = stack.get(currentPath);
            } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PrivateMenuFlowComponent());

            if (MDD.getApp().getAreas().size() == 1) {
                AbstractArea area;
                MDDUI.get().getAppComponent().setArea(area = MDD.getApp().getAreas().get(0));
                if (area != null) {
                    AbstractAction action = area.getDefaultAction();
                    if (!MDD.isMobile() && action != null) {
                        action.run(this);
                        if (stack.size() > 0) v = stack.getLast();
                    } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new AreaComponent(area));
                    if (area != null) MDDUI.get().getAppComponent().setArea(area);
                }
            }

        } else if (state.split("/").length == 2 && !"private/profile".equals(state)) { // es una area

            AbstractArea area = MDD.getApp().getArea(state);

            stack.clear();

            if (area != null) {
                AbstractAction action = area.getDefaultAction();
                if (!MDD.isMobile() && action != null) {
                    action.run(this);
                    if (stack.size() > 0) v = stack.getLast();
                } else if (MDD.isMobile()) {
                    String[] ts = currentPath.split("/");
                    stack.push(ts[0], ("private".equals(ts[0]))?new PrivateMenuFlowComponent():new PublicMenuFlowComponent());
                    stack.push(currentPath, new AreaComponent(area));
                    v = stack.get(currentPath);
                } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new AreaComponent(area));
            }

            if (area != null) MDDUI.get().getAppComponent().setArea(area);

        } else { // cualquier otro caso

            Pair<AbstractArea, MenuEntry> coordinates = getCoordinates(state);

            if (!"private/profile".equals(state) && !"welcome".equals(state)) MDDUI.get().getAppComponent().setCoordinates(coordinates);



            v = stack.get(state);

            if (v != null) {

                stack.popTo(stack.indexOf(v));

            } else {

                String[] steps = state.split("/");

                String path = "";

                int lastIndexInStack = -1; // nos dice hasta que posición del mobile podemos mantener
                boolean coincide = true;
                io.mateu.mdd.vaadinport.vaadin.navigation.View lastView = null;
                int pos = 0;
                String auxPath = path;
                String lastPath = "";
                int lastPos = 0;
                boolean menuPassed = false;

                if (state.startsWith("private/profile")) {

                    currentPath = lastPath = auxPath = "private/profile";

                    v = lastView = stack.get("private/profile");

                    if (v == null) {

                        if (!MDD.isMobile()) stack.clear();
                        openEditor(null, Profile.class, MDD.getUserData(), false);

                        v = lastView = stack.get("private/profile");

                    }


                    lastIndexInStack = 0;

                    lastPos = pos = 2;

                    menuPassed = true;

                }


                // va avanzando en los steps mientra exista en el stack

                while (coincide && pos < steps.length) {
                    lastPath = auxPath;
                    lastPos = pos;
                    if (!"".equals(auxPath)) auxPath += "/";
                    auxPath += steps[pos];

                    if (MDD.isMobile()) {
                        menuPassed = menuPassed || (MDD.getApp().getMenu(auxPath) != null && MDD.getApp().getMenu(auxPath) instanceof AbstractAction);
                        coincide = stack.get(auxPath) != null;

                        if (coincide) {
                            path = auxPath;
                            io.mateu.mdd.vaadinport.vaadin.navigation.View auxV = stack.get(auxPath);
                            lastIndexInStack = stack.indexOf(auxV);
                            lastView = auxV;
                        }

                    } else {

                        menuPassed = menuPassed || MDD.getApp().getMenu(auxPath) != null;


                        if (menuPassed) {
                            //coincide = auxV != null || (!MDD.isMobile() && (MDD.getApp().getMenu(auxPath) != null && !(MDD.getApp().getMenu(auxPath) instanceof AbstractAction)));
                            coincide = stack.get(auxPath) != null;

                            if (coincide) {
                                path = auxPath;
                                io.mateu.mdd.vaadinport.vaadin.navigation.View auxV = stack.get(auxPath);
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

                    String step = steps[currentStepIndex];

                    currentPath = ((Strings.isNullOrEmpty(currentPath))?"":currentPath + "/") + step;


                    boolean procesar = menuPassed && MDD.getApp().getMenu(currentPath) == null && MDD.getApp().getModule(currentPath) == null && lastView != null;


                    if (procesar) {
                        // miramos el último componente añadido

                        Component lastViewComponent = lastView.getComponent();

                        if (step.startsWith("obj___")) {

                            procesarObj(step);

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

                        } else if (lastViewComponent instanceof JPACollectionFieldListViewComponent && "add".equals(step)) {

                            procesarAdd(step, (JPACollectionFieldListViewComponent) lastViewComponent);

                        } else if (lastViewComponent instanceof ListViewComponent) { // el último fué una listView, estamos en un id, add, o en los filtros

                            procesarListViewComponent(state, step, (ListViewComponent) lastViewComponent);

                        } else if (IEditorViewComponent.class.isAssignableFrom(lastViewComponent.getClass())) {
                            //lastViewComponent instanceof EditorViewComponent ||
                            // lastViewComponent instanceof FieldEditorComponent || xxxxxxxxxxxxxxxxxxxx
                            // lastViewComponent instanceof MethodResultViewComponent ||
                            // lastViewComponent instanceof WizardComponent || xxxxxxxxxxxxxxxxxxxx
                            // lastViewComponent instanceof OwnedCollectionComponent || xxxxxxxxxxxxx
                            // lastViewComponent instanceof MethodParametersViewComponent

                            procesarEditor(state, step, (IEditorViewComponent) lastViewComponent);

                        }

                    } else if (currentStepIndex == 0) {

                        if ("public".equals(step)) { // caso "login"

                            if (MDD.isMobile()) {
                                stack.push(currentPath, new PublicMenuFlowComponent());
                                v = stack.get(currentPath);
                            } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PublicMenuFlowComponent());

                        } else if ("private".equals(step)) { // caso "login"

                            if (MDD.isMobile()) {
                                stack.push(currentPath, new PrivateMenuFlowComponent());
                                v = stack.get(currentPath);
                            } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PrivateMenuFlowComponent());

                        }

                    } else if (currentStepIndex == 1) {


                        AbstractArea area = MDD.getApp().getArea(currentPath);

                        AbstractAction action = area.getDefaultAction();
                        if (!MDD.isMobile() && action != null) {
                            action.run(this);
                            if (stack.size() > 0) v = stack.getLast();
                        } else if (MDD.isMobile()) {
                            stack.push(currentPath, new AreaComponent(area));
                            v = stack.get(currentPath);
                        } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new AreaComponent(area));

                        MDDUI.get().getAppComponent().setArea(area);


                    } else if (MDD.getApp().getModule(currentPath) != null) {

                        AbstractModule module = MDD.getApp().getModule(currentPath);

                        stack.push(currentPath, new ModuleComponent(module));

                    } else {

                        MenuEntry e = MDD.getApp().getMenu(currentPath);
                        if (e != null) {
                            if (e instanceof AbstractAction) {
                                ((AbstractAction) e).run(this);
                            } else if (e instanceof AbstractMenu) {
                                stack.push(currentPath, new MenuFlowComponent((AbstractMenu) e));
                            }
                        }

                    }

                    currentStepIndex++;
                    v = lastView = stack.get(currentPath);

                    if (v != null) {
                        Component c = ((io.mateu.mdd.vaadinport.vaadin.navigation.View) v).getViewComponent();
                        if (c != null && c instanceof AbstractViewComponent) {
                            ((AbstractViewComponent)c).buildIfNeeded();
                        }
                    }

                }



                // aquí

                if (v == null) {

                    MenuEntry e = MDD.getApp().getMenu(currentPath);
                    if (e != null) {
                        if (e instanceof AbstractMenu) {
                            if (MDD.isMobile()) {
                                stack.push(currentPath, new MobileMenuComponent(e));
                            } else {
                                stack.push(currentPath, new MenuFlowComponent((AbstractMenu) e));
                            }
                            currentStepIndex++;
                            v = stack.get(currentPath);
                        } else if (e instanceof AbstractAction) {
                            stack.push(currentPath, new ComponentWrapper(e.getName(), new Label("", ContentMode.HTML)));
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

        if (v == null) v = new VoidView(stack);


        Component c = ((io.mateu.mdd.vaadinport.vaadin.navigation.View) v).getViewComponent();
        if (c != null && c instanceof AbstractViewComponent) {
            ((AbstractViewComponent)c).buildIfNeeded();
            ((AbstractViewComponent)c).updatePageTitle();
        }
        if (c.getStyleName().contains("refreshOnBack")) {

            if (c != null && c instanceof EditorViewComponent) {
                EditorViewComponent evc = (EditorViewComponent) c;
                Object id = ReflectionHelper.getId(evc.getModel());
                if (id != null) {
                    try {
                        evc.load(id);
                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
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

        if (c != null & c instanceof JPAListViewComponent) {
            Notification.show(((MDD.isMobile())?"Click":"Double click") + " on matches to edit", Notification.Type.TRAY_NOTIFICATION);
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


        AppComponent appComponent = MDDUI.get().getAppComponent();
        if (appComponent instanceof DesktopAppComponent) {
            DesktopAppComponent dac = (DesktopAppComponent) appComponent;
            if (v.isMenuExpanded()) {
                dac.maximizeLeftSide();
            } else {
                //dac.minimizeLeftSide();
            }
        }

        return v;

    }

    private void procesarEditor(String state, String step, IEditorViewComponent evfc) {
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
            field = ReflectionHelper.getFieldByName(r.getClass(), step.endsWith("_new") ? step.replaceAll("_new", "") : step);
        }

        if (method != null) {

            callMethod(state, method, r, (Component) evfc);

        } else if (field != null) {


            boolean ownedCollection = ReflectionHelper.isOwnedCollection(field);

            if (field.isAnnotationPresent(UseLinkToListView.class)) {
                try {

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

                                            Helper.notransact(em -> {

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
                                            MDD.alert(throwable);
                                        }

                                    }
                                }
                            });

                        }

                        stack.push(currentPath, vc);

                    }

                } catch (Exception e) {
                    MDD.alert(e);
                }
            } else if (ownedCollection) {

                try {
                    stack.push(currentPath, new OwnedCollectionComponent(evfc.getBinder(), field, field.isAnnotationPresent(UseLinkToListView.class) ? -1 : 0));
                } catch (Exception e) {
                    MDD.alert(e);
                }


            } else if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {

                ListViewComponent lvc = null;
                Component vc = null;

                try {

                    if (field.isAnnotationPresent(UseLinkToListView.class)) evfc.save(false);

                    vc = new JPACollectionFieldViewComponent(field.getGenericClass(), field, evfc, false);

                    stack.push(currentPath, vc);

                } catch (Throwable e) {
                    MDD.alert(e);
                }


            } else {

                try {
                    procesarFieldEditor(evfc, field, step);
                } catch (Throwable e) {
                    MDD.alert(e);
                }

            }

        } else if (evfc instanceof OwnedCollectionComponent) {

            int index = Integer.parseInt(step);
            try {
                ((OwnedCollectionComponent) evfc).setIndex(index);
            } catch (Exception e) {
                MDD.alert(e);
            }

        }

        if (evfc != null && evfc instanceof EditorViewComponent)
            currentEditor = (EditorViewComponent) evfc;

    }

    private void procesarFieldEditor(IEditorViewComponent parentEditor, FieldInterfaced field, String step) throws Throwable {
        MDDBinder parentBinder = parentEditor.getBinder();
        if (ReflectionHelper.isBasico(field.getType())) {
            stack.push(currentPath, new FieldEditorComponent(parentBinder, field));
        } else {
            Object o = ReflectionHelper.getValue(field, parentEditor.getModel());
            boolean add = o == null || step.endsWith("_new");
            EditorViewComponent evc = add?new EditorViewComponent(field.getType()):new EditorViewComponent(o);
            if (add) evc.load(null);
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
                        MDD.alert(e);
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
                            MDD.alert(e);
                        }
                    }
                }
            });
            stack.push(currentPath, evc);
        }
    }

    private void procesarListViewComponent(String state, String step, ListViewComponent lvc) {
        // step es filters, add o el id del objeto a editar

        Method method = lvc.getMethod(step);

        if (method == null && !"filters".equals(step) && lvc instanceof RpcListViewComponent) {
            method = ReflectionHelper.getMethod(((RpcListViewComponent) lvc).getRpcListView().getClass(), "onEdit");
            if (pendingResult == null) {
                try {
                    method = ((RpcListViewComponent) lvc).getRpcListView().getClass().getMethod("onEdit", String.class);
                    if (method != null) {
                        pendingResult = method.invoke(((RpcListViewComponent) lvc).getRpcListView(), step);
                    }
                } catch (Exception e) {
                    MDD.alert(e);
                }
            }
        }

        if (method != null) {

            callMethod(state, method, lvc instanceof RpcListViewComponent ? ((RpcListViewComponent) lvc).getRpcListView() : null, lvc);

        } else if ("filters".equals(step)) {

            try {
                stack.push(currentPath, new FiltersViewFlowComponent(lvc));
            } catch (Exception e) {
                MDD.alert(e);
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

                stack.push(currentPath, evc);


            } else if (lvc instanceof CollectionListViewComponent) {

                CollectionListViewComponent cflvc = (CollectionListViewComponent) lvc;

                EditorViewComponent evc = new EditorViewComponent(cflvc, cflvc.deserializeId(step), null, null);

                stack.push(currentPath, evc);

            } else {

                EditorViewComponent evc = new EditorViewComponent(lvc, lvc.getModelType());
                try {

                    if (Strings.isNullOrEmpty(step) || "new".equals(step)) { // estamos añadiendo un nuevo registro
                        evc.load(null);
                    } else { // step es el id del objeto a editar
                        String sid = step;
                        evc.load(lvc.deserializeId(sid));
                    }

                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }

                stack.push(currentPath, evc);

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
                        MDD.alert(e);
                    }
                }

                @Override
                public void onGoBack(Object model) {

                }
            });

            pendingResult = null;

            stack.push(currentPath, evc);

        } catch (Exception e) {
            MDD.alert(e);
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
                o = Helper.find(c, ReflectionHelper.toId(c, id));
            }

            if (o instanceof User) throw new Exception("Users are not accesible this way!");

            EditorViewComponent evc = new EditorViewComponent(o);

            stack.push(currentPath, evc);


        } catch (Throwable e) {
            MDD.alert(e);
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
            auxPath += steps[pos];

            if (pos == 1) area = MDD.getApp().getArea(auxPath);

            menuPassed = (menu = MDD.getApp().getMenu(auxPath)) != null;

            if (menuPassed) break;

            pos++;
        }

        return new Pair<>(area, menu);

    }


    @Override
    public void alert(String s) {
        MDD.alert(s);
    }

    @Override
    public void openEditor(MDDOpenEditorAction action, Class viewClass, Object id, boolean modifierPressed) {
        stack.push(currentPath, MDDViewComponentCreator.createComponent(action, viewClass, id, modifierPressed));
    }

    @Override
    public void openListView(MDDOpenListViewAction action, Class viewClass, boolean modifierPressed) {
        stack.push(currentPath, MDDViewComponentCreator.createComponent(action, viewClass, modifierPressed));
    }

    @Override
    public void openCRUD(MDDOpenCRUDAction action, Class entityClass, String queryFilters, ExtraFilters extraFilters, boolean modifierPressed) {
        stack.push(currentPath, MDDViewComponentCreator.createComponent(action, entityClass, queryFilters, extraFilters, modifierPressed));
    }

    @Override
    public void openComponent(AbstractAction action, Class componentClass, boolean modifierPressed) {
        try {
            stack.push(currentPath, (Component) componentClass.newInstance());
        } catch (Exception e) {
            MDD.alert(e);
        }
    }

    @Override
    public void openWizardPage(Class firstPageClass) {
        try {
            stack.push(currentPath, MDDViewComponentCreator.createComponent((WizardPage) firstPageClass.newInstance()));
        } catch (Exception e) {
            MDD.alert(e);
        }
    }

    @Override
    public void open(AbstractAction action, Component component, boolean modifierPressed) {
        stack.push(currentPath, component);
    }

    @Override
    public void callMethod(String state, Class entityClass, String methodName) {
        Method method = ReflectionHelper.getMethod(entityClass, methodName);

        if (method != null) {
            try {
                callMethod(state, method, Modifier.isStatic(method.getModifiers())?null:entityClass.newInstance(), null);
            } catch (Exception e) {
                MDD.alert(e);
            }
        } else MDD.alert("Method " + methodName + " does not exist. Is it a typo?");
    }

    @Override
    public void callMethod(String state, Method method, Object instance, Component lastViewComponent) {
        if (method != null) {
            try {

                if (lastViewComponent instanceof JPACollectionFieldListViewComponent) {
                    instance = ((JPACollectionFieldListViewComponent) lastViewComponent).getEvfc().getModel();
                }

                if (method.isAnnotationPresent(Action.class) && method.getAnnotation(Action.class).refreshOnBack()) {
                    lastViewComponent.addStyleName("refreshOnBack");
                }

                if (pendingResult != null) {

                    procesarResultado(method, pendingResult, lastViewComponent);

                } else {

                    boolean hasNonInjectedParameters = false;

                    for (Parameter p : method.getParameters()) if (!ReflectionHelper.isInjectable(p)) {
                        hasNonInjectedParameters = true;
                        break;
                    }

                    if (hasNonInjectedParameters) {
                        stack.push(currentPath, new MethodParametersViewComponent(instance, method, pendingSelection));
                    } else {
                        procesarResultado(method, ReflectionHelper.execute(MDD.getUserData(), method, new MDDBinder(new ArrayList<>()), instance, pendingSelection), lastViewComponent);
                    }

                }

            } catch (Throwable e) {
                MDD.alert(e);
            }
        }
    }

    private void procesarResultado(Method m, Object r, Component lastViewComponent) throws InvocationTargetException, NoSuchMethodException, InstantiationException, IllegalAccessException {
        String title = m != null?"Result of " + Helper.capitalize(m.getName()):"Result";
        if (r == null) {
            stack.push(currentPath, new ComponentWrapper(title, new Label("Empty result", ContentMode.HTML)));
        } else {
            Class c = r.getClass();

            if (r instanceof Class && ((Class)r).isAnnotationPresent(Entity.class)) {
                stack.push(currentPath, new JPAListViewComponent((Class) r));
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
                stack.push(currentPath, new ComponentWrapper(title, new Label("" + r, ContentMode.HTML)));
            } else if (URL.class.equals(c)) {
                if (m != null && m.isAnnotationPresent(IFrame.class) || m.toString().endsWith("pdf")) {
                    BrowserFrame b = new BrowserFrame("Result", new ExternalResource(r.toString()));
                    b.setSizeFull();
                    stack.push(currentPath, new ComponentWrapper(title, b));
                } else {
                    stack.push(currentPath, new ComponentWrapper(title, new Link("Click me to view the result", new ExternalResource(r.toString()))));
                }
            } else if (r instanceof Collection && ((Collection) r).size() > 0 && ((Collection) r).iterator().next() != null && ((Collection) r).iterator().next().getClass().isAnnotationPresent(Entity.class)) {
                stack.push(currentPath, new CollectionListViewComponent((Collection) r, ((Collection) r).iterator().next().getClass()));
            } else if (Collection.class.isAssignableFrom(c)) {

                Collection col = (Collection) r;

                if (col.size() == 0) {
                    stack.push(currentPath, new ComponentWrapper(title, new Label("Empty list", ContentMode.HTML)));
                } else if (m != null && m.isAnnotationPresent(Pdf.class) || Query.class.isAssignableFrom(m.getReturnType())) {
                    try {
                        stack.push(currentPath, new ComponentWrapper(title, new PdfComponent((List) r)));
                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                } else {

                    if (MDD.isMobile()) {

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

                        stack.push(currentPath, new ComponentWrapper(title, g));
                    }

                }


            } else if (r instanceof Query) {

                try {
                    stack.push(currentPath, new ComponentWrapper(title, new PdfComponent((Query) r)));
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }

            } else if (r instanceof RpcView) {

                if (m != null && m.isAnnotationPresent(Output.class)) {
                    try {
                        stack.push(currentPath, new ComponentWrapper(title, new PdfComponent((RpcView) r, r, null)));
                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                } else {
                    stack.push(currentPath, new RpcListViewComponent((RpcView) r));
                }

            } else if (m != null && m.isAnnotationPresent(Output.class)) {

                stack.push(currentPath, new ComponentWrapper(title, new PrintPOJOComponent(r)));

            } else if (r.getClass().isAnnotationPresent(Entity.class) || PersistentPOJO.class.isAssignableFrom(r.getClass())) {
                stack.push(currentPath, new EditorViewComponent(r, lastViewComponent));
            } else if (r instanceof Component) {
                stack.push(currentPath, new ComponentWrapper(title, (Component) r));
            } else if (r instanceof AbstractAction) {
                ((AbstractAction) r).run(this);
            } else if (r instanceof WizardPage) {
                stack.push(currentPath, new WizardComponent((WizardPage) r));
            } else {
                stack.push(currentPath, new EditorViewComponent(r));
            }

        }
        pendingResult = null;

    }

    @Override
    public String getCurrentState() {

        String state = currentPath;

        if (stack.size() > 0) {

            io.mateu.mdd.vaadinport.vaadin.navigation.View lastView = stack.getLast();

            state = stack.getState(lastView);

        }


        return state;
    }


    public boolean isEditingNewRecord() {
        return currentEditor != null && currentEditor.isNewRecord();
    }
}
