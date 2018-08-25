package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.google.common.base.Strings;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewProvider;
import com.vaadin.server.Page;
import com.vaadin.ui.Component;
import com.vaadin.ui.Notification;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.EntityProvider;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.Pair;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.AreaComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.OAuthHelper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.*;
import io.mateu.mdd.vaadinport.vaadin.pojos.Profile;

import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Query;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
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

public class MDDViewProvider implements ViewProvider, MDDExecutionContext {

    private final ViewStack stack;
    private String currentPath;

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
        View v = null;

        if (Strings.isNullOrEmpty(state)) { // caso ""

            if (!MDD.getApp().hasPublicContent()) {
                if (MDD.getUserData() == null) state = "login";
                else state = MDD.getApp().getState(MDD.getApp().getDefaultPrivateArea());
            } else {
                state = MDD.getApp().getState(MDD.getApp().getDefaultPublicArea());
            }

        }

        if ("oauth/github/callback".equalsIgnoreCase(state)) {

            //http://localhost:8080/callback?code=c0324687fdcdf68fde05

            System.out.println("state = " + state);

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

            System.out.println("state = " + state);

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

            System.out.println("state = " + state);

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

            currentPath = state;

        if ("login".equals(state)) { // caso "login"

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new LoginFlowComponent());

        } else if ("menu".equals(state)) { // caso "login"

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new SearchInMenuComponent());

        } else if ("bye".equals(state)) { // caso "login"

            MDD.setUserData(null);

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new ByeComponent());

            MDDUI.get().getAppComponent().setArea(MDD.getApp().getDefaultPublicArea());

        } else if ((state.startsWith("private") || state.equals("welcome") || state.equals("profile")) && MDD.getUserData() == null) {

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new LoginFlowComponent());


        } else if ("welcome".equals(state)) { // caso "login"

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new WelcomeComponent());

            MDDUI.get().getAppComponent().setArea(MDD.getApp().getDefaultPrivateArea());

        } else if ("public".equals(state)) { // caso "login"

            stack.clear();

            if (MDD.isMobile()) {
                stack.push(currentPath, new PublicMenuFlowComponent());
                v = stack.get(currentPath);
            } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PublicMenuFlowComponent());

        } else if ("private".equals(state)) { // caso "login"

            stack.clear();

            if (MDD.isMobile()) {
                stack.push(currentPath, new PrivateMenuFlowComponent());
                v = stack.get(currentPath);
            } else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PrivateMenuFlowComponent());


        } else if (state.split("/").length == 2 && !"private/profile".equals(state)) { // es una area

            AbstractArea area = MDD.getApp().getArea(state);

            stack.clear();

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

            MDDUI.get().getAppComponent().setArea(area);

        } else { // cualquier otro caso

            Pair<AbstractArea, MenuEntry> coordinates = getCoordinates(state);

            MDDUI.get().getAppComponent().setCoordinates(coordinates);



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

                if (state.startsWith("private/profile")) { // caso "login"

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

                        //menuPassed = menuPassed || stack.get(auxPath) != null || (MDD.getApp().getMenu(auxPath) != null && MDD.getApp().getMenu(auxPath) instanceof AbstractAction);

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


                /*
                // nos hemos parado en una acción pero no existe la vista
                if (lastView == null && MDD.getApp().getMenu(auxPath) != null && MDD.getApp().getMenu(auxPath) instanceof AbstractAction) {
                    ((AbstractAction)MDD.getApp().getMenu(auxPath)).run(this);
                    lastView = stack.get(lastPath);
                    lastIndexInStack = stack.indexOf(lastView);
                }
                */



                if (lastIndexInStack < stack.size() - 1) stack.popTo(lastIndexInStack);


                // aquí el stack está limpio hasta el último contenido que coincide


                // vamos creando el stack hasta que terminemos los steps

                int currentStepIndex = lastPos;
                currentPath = lastPath;
                while (currentStepIndex < steps.length) { //vamos completando

                    String step = steps[currentStepIndex];

                    currentPath = ((Strings.isNullOrEmpty(currentPath))?"":currentPath + "/") + step;


                    //recordar: (private|public)/area/modulo/menu/menu/accion


                    boolean procesar = menuPassed && MDD.getApp().getMenu(currentPath) == null && MDD.getApp().getModule(currentPath) == null && lastView != null;


                    if (procesar) {
                        // miramos el último componente añadido

                        Component lastViewComponent = lastView.getComponent();


                        if (lastViewComponent instanceof JPACollectionFieldCRUDViewComponent && "add".equals(step)) {

                            JPACollectionFieldCRUDViewComponent cfcvc = (JPACollectionFieldCRUDViewComponent) lastViewComponent;

                            try {
                                Component vc = new JPACollectionFieldCRUDViewComponent(cfcvc.getField(), cfcvc.getEvfc(), true).build();

                                stack.push(currentPath, vc);

                            } catch (Exception e) {
                                MDD.alert(e);
                            }

                        } else if (lastViewComponent instanceof CRUDViewComponent || lastViewComponent instanceof ListViewComponent) { // el último fué una listView, estamos en un id, add, o en los filtros

                            ListViewComponent lvc = null;
                            if (lastViewComponent instanceof CRUDViewComponent) {
                                CRUDViewComponent vfc = (CRUDViewComponent) lastViewComponent;
                                lvc = vfc.getListViewComponent();
                            } else if (lastViewComponent instanceof ListViewComponent) {
                                lvc = (ListViewComponent) lastViewComponent;
                            }


                            // step es filters, add o el id del objeto a editar

                            Method method = lvc.getMethod(step);


                            if (method != null) {

                                stack.push(currentPath, new MethodParametersViewFlowComponent(state, method, null, this, null));

                            } else if ("filters".equals(step)) {

                                stack.push(currentPath, new FiltersViewFlowComponent(state, lvc));

                            } else {

                                if (lastViewComponent instanceof CRUDViewComponent) {
                                    CRUDViewComponent vfc = (CRUDViewComponent) lastViewComponent;

                                    EditorViewComponent evc = vfc.getEditorViewComponent();
                                    evc.clear();

                                    try {

                                        if (Strings.isNullOrEmpty(step) || "new".equals(step)) { // estamos añadiendo un nuevo registro
                                            evc.load(null);
                                        } else { // step es el id del objeto a editar
                                            String sid = step;
                                            evc.load(vfc.getListViewComponent().deserializeId(sid));
                                        }

                                    } catch (Throwable throwable) {
                                        throwable.printStackTrace();
                                    }

                                    stack.push(currentPath, evc);

                                } else {

                                }
                            }

                        } else if (lastViewComponent instanceof EditorViewComponent || lastViewComponent instanceof MethodResultViewFlowComponent || lastViewComponent instanceof WizardComponent || lastViewComponent instanceof OwnedCollectionComponent) {

                            EditorViewComponent auxevfc = null;

                            if (lastViewComponent instanceof MethodResultViewFlowComponent) {
                                lastViewComponent = ((MethodResultViewFlowComponent)lastViewComponent).getComponent(0);
                            }

                            if (lastViewComponent instanceof WizardComponent) {
                                auxevfc = ((WizardComponent) lastViewComponent).getEditorViewComponent();
                            } else if (lastViewComponent instanceof OwnedCollectionComponent) {
                                    auxevfc = ((OwnedCollectionComponent) lastViewComponent).getEditorViewComponent();
                            } else {
                                auxevfc = (EditorViewComponent) lastViewComponent;
                            }

                            EditorViewComponent evfc = auxevfc;


                            Method method = evfc.getMethod(step);

                            FieldInterfaced field = evfc.getField(step);

                            if (method != null) {

                                stack.push(currentPath, new MethodParametersViewFlowComponent(state, method, evfc.getModel(), this, evfc.getBinder()));

                            } else if (field != null) {


                                boolean ownedCollection = ReflectionHelper.isOwnedCollection(field);

                                if (field.isAnnotationPresent(ManyToOne.class) && field.isAnnotationPresent(UseLinkToListView.class)) {
                                    try {

                                        UseLinkToListView aa = field.getAnnotation(UseLinkToListView.class);

                                        {

                                            ListViewComponent lvc = null;
                                            Component vc = null;

                                            if (!Void.class.equals(aa.listViewClass())) {

                                                vc = lvc = new RpcListViewComponent(aa.listViewClass()).build();

                                            } else {

                                                lvc = new JPAListViewComponent(field.getType()).build();

                                                vc = new CRUDViewComponent(lvc, new EditorViewComponent(field.getType()).build()).build();


                                            }

                                            lvc.addListener(new ListViewComponentListener() {
                                                @Override
                                                public void onEdit(Object id) {

                                                }

                                                @Override
                                                public void onSelect(Object id) {
                                                    System.out.println("Han seleccionado " + id);
                                                    Optional o = (Optional) id;
                                                    if (o.isPresent()) {

                                                        try {

                                                            Helper.notransact(em -> {

                                                                Object m = evfc.getModel();
                                                                Object oid = o.get();


                                                                Object e = null;

                                                                if (oid instanceof Object[]) {
                                                                    e = em.find(field.getType(), ((Object[]) oid)[0]);
                                                                } else if (oid instanceof EntityProvider) {
                                                                    e = ((EntityProvider) oid).toEntity(em);
                                                                } else {
                                                                    e = em.find(field.getType(), oid);
                                                                }

                                                                ReflectionHelper.setValue(field, m, e);
                                                                evfc.updateModel(m);

                                                                MDDUI.get().getNavegador().goBack();

                                                            });
                                                        } catch (Throwable throwable) {
                                                            MDD.alert(throwable);
                                                        }

                                                    }
                                                }
                                            });

                                            stack.push(currentPath, vc);

                                        }

                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                } else if (ownedCollection) {

                                    try {
                                        stack.push(currentPath, new OwnedCollectionComponent(evfc.getBinder(), field));
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }


                                } else if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {

                                    ListViewComponent lvc = null;
                                    Component vc = null;

                                    try {

                                        if (field.isAnnotationPresent(UseLinkToListView.class)) evfc.save(false);

                                        vc = new JPACollectionFieldCRUDViewComponent(field, evfc, false).build();

                                        stack.push(currentPath, vc);

                                    } catch (Throwable e) {
                                        MDD.alert(e);
                                    }


                                } else {
                                    stack.push(currentPath, new FieldEditorComponent(evfc.getBinder(), field));
                                }

                            } else if (lastViewComponent instanceof OwnedCollectionComponent) {

                                int index = Integer.parseInt(step);
                                try {
                                    ((OwnedCollectionComponent) lastViewComponent).setIndex(index);
                                } catch (Exception e) {
                                    MDD.alert(e);
                                }

                            }

                        } else {
                            // step es el id de la vista

                            Class modelType = null;
                            try {

                                modelType = Class.forName(step);
                                CRUDViewComponent cv = new CRUDViewComponent(new JPAListViewComponent(modelType).build(), new EditorViewComponent(modelType).build()).build();

                                stack.push(currentPath, cv);

                            } catch (ClassNotFoundException e) {
                                e.printStackTrace();
                            } catch (IllegalAccessException e) {
                                e.printStackTrace();
                            } catch (InstantiationException e) {
                                e.printStackTrace();
                            }

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
                }



                if (v == null) {

                    MenuEntry e = MDD.getApp().getMenu(currentPath);
                    if (e != null) {
                        if (e instanceof AbstractMenu) {
                            if (MDD.isMobile()) {
                                stack.push(currentPath, new MobileMenuComponent(e));
                                currentStepIndex++;
                                v = lastView = stack.get(currentPath);
                            }
                            else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new MenuFlowComponent((AbstractMenu) e));
                        }
                    } else {
                        if (currentStepIndex == 0) { // public | private --> lista de areas
                            if ("public".equalsIgnoreCase(path)) {
                                if (MDD.isMobile()) {
                                    stack.push(currentPath, new PublicMenuFlowComponent());
                                    currentStepIndex++;
                                    v = lastView = stack.get(currentPath);
                                }
                                else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PublicMenuFlowComponent());
                            } else if ("private".equalsIgnoreCase(path)) {
                                if (MDD.isMobile()) {
                                    stack.push(currentPath, new PrivateMenuFlowComponent());
                                    currentStepIndex++;
                                    v = lastView = stack.get(currentPath);
                                }
                                else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PrivateMenuFlowComponent());
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

        if (v == null) v = new VoidView();

        if (v != null && v instanceof io.mateu.mdd.vaadinport.vaadin.navigation.View && ((io.mateu.mdd.vaadinport.vaadin.navigation.View)v).getComponent() instanceof CRUDViewComponent) Notification.show(((MDD.isMobile())?"Click":"Double click") + " on matches to edit", Notification.Type.TRAY_NOTIFICATION);

        return v;

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
    public void openCRUD(MDDOpenCRUDAction action, Class entityClass, String queryFilters, boolean modifierPressed) {
        stack.push(currentPath, MDDViewComponentCreator.createComponent(action, entityClass, queryFilters, modifierPressed));
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
    public void callMethod(AbstractAction action, Class entityClass, String methodName) {
        Method method = ReflectionHelper.getMethod(entityClass, methodName);

        if (method != null) {
            try {
                callMethod(action, method, Modifier.isStatic(method.getModifiers())?null:entityClass.newInstance());
            } catch (Exception e) {
                MDD.alert(e);
            }
        } else MDD.alert("Method " + methodName + " does not exist. Is it a typo?");
    }

    @Override
    public void callMethod(AbstractAction action, Method method, Object instance) {
        if (method != null) {
            try {

                boolean hasNonInjectedParameters = false;

                for (Parameter p : method.getParameters()) if (!ReflectionHelper.isInjectable(p)) {
                    hasNonInjectedParameters = true;
                    break;
                }



                if (hasNonInjectedParameters) {
                    stack.push(currentPath, new MethodParametersViewFlowComponent(currentPath, method, instance, this, null));
                } else {

                    if (Query.class.equals(method.getReturnType())) {

                        MDDUI.get().getNavegador().showResult(currentPath, method, ReflectionHelper.invokeInjectableParametersOnly(method, instance), this, false);

                    } else {

                        MDDUI.get().getNavegador().showResult(currentPath, method, ReflectionHelper.invokeInjectableParametersOnly(method, instance), this, false);

                    }
                }

            } catch (Throwable e) {
                MDD.alert(e);
            }
        }
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


}
