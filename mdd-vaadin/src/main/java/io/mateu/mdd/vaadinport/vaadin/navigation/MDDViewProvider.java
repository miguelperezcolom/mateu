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
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.Pair;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.views.AreaComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.OAuthHelper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.*;
import io.mateu.mdd.vaadinport.vaadin.pojos.Profile;

import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
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

            MyUI.get().getAppComponent().setArea(MDD.getApp().getDefaultPublicArea());

        } else if ((state.startsWith("private") || state.equals("welcome") || state.equals("profile")) && MDD.getUserData() == null) {

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new LoginFlowComponent());


        } else if ("welcome".equals(state)) { // caso "login"

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new WelcomeComponent());

            MyUI.get().getAppComponent().setArea(MDD.getApp().getDefaultPrivateArea());

        } else if ("public".equals(state)) { // caso "login"

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PublicMenuFlowComponent());

        } else if ("private".equals(state)) { // caso "login"

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PrivateMenuFlowComponent());


        } else if (state.split("/").length == 2 && !"private/profile".equals(state)) { // es una area

            AbstractArea area = MDD.getApp().getArea(state);

            stack.clear();

            AbstractAction action = area.getDefaultAction();
            if (action != null) {
                action.run(this);
                if (stack.size() > 0) v = stack.getLast();
            }
            else v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new AreaComponent(area));

            MyUI.get().getAppComponent().setArea(area);

        } else { // cualquier otro caso

            Pair<AbstractArea, MenuEntry> coordinates = getCoordinates(state);

            MyUI.get().getAppComponent().setCoordinates(coordinates);



            v = stack.get(state);

            if (v != null) {

                stack.popTo(stack.indexOf(v));

            } else {

                String[] steps = state.split("/");

                String path = "";

                int lastIndexInStack = -1; // nos dice hasta que posición del flow podemos mantener
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

                        stack.clear();
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

                    menuPassed = menuPassed || stack.get(auxPath) != null || (MDD.getApp().getMenu(auxPath) != null && MDD.getApp().getMenu(auxPath) instanceof AbstractAction);

                    if (menuPassed) {
                        io.mateu.mdd.vaadinport.vaadin.navigation.View auxV = stack.get(auxPath);
                        coincide = auxV != null || (MDD.getApp().getMenu(auxPath) != null && !(MDD.getApp().getMenu(auxPath) instanceof AbstractAction));

                        if (coincide) {
                            path = auxPath;
                            lastIndexInStack = stack.indexOf(auxV);
                            lastView = auxV;
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


                    boolean procesar = menuPassed && MDD.getApp().getMenu(currentPath) == null && lastView != null;


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

                        } else if (lastViewComponent instanceof CRUDViewComponent || lastViewComponent instanceof  ListViewComponent) { // el último fué una listView, estamos en un id, add, o en los filtros

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

                                stack.push(currentPath, new MethodParametersViewFlowComponent(state, method, null, this));

                            } else if ("filters".equals(step)) {

                                stack.push(currentPath, new FiltersViewFlowComponent(state, lvc));

                            } else {

                                if (lastViewComponent instanceof CRUDViewComponent) {
                                    CRUDViewComponent vfc = (CRUDViewComponent) lastViewComponent;

                                    EditorViewComponent evc = vfc.getEditorViewComponent();

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

                        } else if (lastViewComponent instanceof EditorViewComponent) {

                            EditorViewComponent evfc = (EditorViewComponent) lastViewComponent;

                            Method method = evfc.getMethod(step);

                            FieldInterfaced field = evfc.getField(step);

                            if (method != null) {

                                stack.push(currentPath, new MethodParametersViewFlowComponent(state, method, evfc.getModel(), this));

                            } else if (field != null) {

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

                                                                MyUI.get().getNavegador().goBack();

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
                                } else if (field.isAnnotationPresent(OneToMany.class)) {

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


                            //crud.loadInEditor(sid);


                        }

                    } else {

                        MenuEntry e = MDD.getApp().getMenu(currentPath);
                        if (e != null) {
                            if (e instanceof AbstractAction) {
                                ((AbstractAction) e).run(this);
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
                            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new MenuFlowComponent((AbstractMenu) e));
                        }
                    } else {
                        if (currentStepIndex == 0) { // public | private --> lista de areas
                            if ("public".equalsIgnoreCase(path))
                                v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PublicMenuFlowComponent());
                            else if ("private".equalsIgnoreCase(path))
                                v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new PrivateMenuFlowComponent());
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

        if (v != null && v instanceof io.mateu.mdd.vaadinport.vaadin.navigation.View && ((io.mateu.mdd.vaadinport.vaadin.navigation.View)v).getComponent() instanceof CRUDViewComponent) Notification.show("Double click on matches to edit", Notification.Type.TRAY_NOTIFICATION);

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
        }
    }

    @Override
    public void callMethod(AbstractAction action, Method method, Object instance) {
        if (method != null) {
            try {

                if (method.getParameterCount() > 0) {
                    stack.push(currentPath, new MethodParametersViewFlowComponent(currentPath, method, instance, this));
                } else {
                    MyUI.get().getNavegador().showResult(method, method.invoke(instance), this, false);
                }

            } catch (Exception e) {
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
