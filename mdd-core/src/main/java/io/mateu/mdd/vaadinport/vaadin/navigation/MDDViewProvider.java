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
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.EntityProvider;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.Pair;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.AreaComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.OAuthHelper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.*;
import io.mateu.mdd.vaadinport.vaadin.pojos.Profile;

import javax.persistence.*;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.net.URI;
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
    public Set pendingSelection;
    public Object pendingResult;
    private String currentPath;

    private EditorViewComponent currentEditor;
    private String pendingPrivateState;

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
        View v = null;

        if (state.startsWith("app/")) state = state.substring("app/".length());


        if (Strings.isNullOrEmpty(state)) { // caso ""

            if (!MDD.getApp().hasPublicContent()) {
                if (MDD.getUserData() == null) state = "login";
                else {
                    if (MDD.isMobile()) state = "private";
                    else state = MDD.getApp().getState(MDD.getApp().getDefaultPrivateArea());
                }
            } else {
                if (MDD.isMobile()) state = "public";
                else state = MDD.getApp().getState(MDD.getApp().getDefaultPublicArea());
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

        if ("welcome".equals(state) && MDD.getUserData() != null) { // caso "login"
            System.out.println("-->welcome (" + pendingPrivateState + ")");
            if (!Strings.isNullOrEmpty(pendingPrivateState)) {
                String newState = pendingPrivateState;
                pendingPrivateState = null;
                if (newState.startsWith("/")) newState = newState.substring(1);

                System.out.println("-->going to (" + MDD.getApp().getBaseUrl() + newState + ")");

                Page.getCurrent().open(MDD.getApp().getBaseUrl() + newState, null);
            }
        }

        currentEditor = null;
        currentPath = state;

        if (state.startsWith("resetpassword")) { // caso "login"

            stack.clear();

            v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(stack, new ResetPasswordFlowComponent(state.split("/")[1]));

        } else if ("login".equals(state)) { // caso "login"

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

            pendingPrivateState = state;

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

                        if (lastViewComponent instanceof MethodResultViewFlowComponent && ((MethodResultViewFlowComponent)lastViewComponent).getResult() instanceof AbstractViewComponent) lastViewComponent = (Component) ((MethodResultViewFlowComponent)lastViewComponent).getResult();


                        if (lastViewComponent instanceof JPACollectionFieldListViewComponent && "add".equals(step)) {

                            JPACollectionFieldListViewComponent cfcvc = (JPACollectionFieldListViewComponent) lastViewComponent;

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

                                EditorViewComponent evc = new EditorViewComponent(pendingResult != null?pendingResult:cfcvc.addNew(), null, hiddenFields);

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
                        } else if (lastViewComponent instanceof JPACollectionFieldCRUDViewComponent && "add".equals(step)) {

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

                            if (method == null && !"filters".equals(step) && lastViewComponent instanceof RpcListViewComponent) {
                                method = ReflectionHelper.getMethod(((RpcListViewComponent)lastViewComponent).getRpcListView().getClass(), "onEdit");
                                if (pendingResult == null) {
                                    try {
                                        method = ((RpcListViewComponent)lastViewComponent).getRpcListView().getClass().getMethod("onEdit", String.class);
                                        if (method != null) {
                                            pendingResult = method.invoke(((RpcListViewComponent)lastViewComponent).getRpcListView(), step);
                                        }
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                }
                            }

                            if (method != null) {

                                callMethod(state, method, lvc instanceof RpcListViewComponent?((RpcListViewComponent)lvc).getRpcListView():null);

                                /*


xxxxxxxxxxxxxxxx

                                if (pendingResult != null) {
                                    if (pendingResult.getClass().isAnnotationPresent(Entity.class) || PersistentPOJO.class.isAssignableFrom(pendingResult.getClass())) {
                                        stack.push(currentPath, new EditorViewComponent(pendingResult));
                                    } else {
                                        try {
                                            stack.push(currentPath, new MethodResultViewFlowComponent(state, method, pendingResult));
                                        } catch (Exception e) {
                                            MDD.alert(e);
                                        }
                                    }
                                    pendingResult = null;
                                } else {
                                    stack.push(currentPath, new MethodParametersViewFlowComponent(state, method, lvc instanceof RpcListViewComponent?((RpcListViewComponent)lvc).getRpcListView():null, this, null, pendingSelection));
                                    pendingSelection = null;
                                }
                                */

                            } else if ("filters".equals(step)) {

                                stack.push(currentPath, new FiltersViewFlowComponent(state, lvc));

                            } else {

                                if (lastViewComponent instanceof CRUDViewComponent) {
                                    CRUDViewComponent vfc = (CRUDViewComponent) lastViewComponent;

                                    EditorViewComponent evc = vfc.getEditorViewComponent();
                                    evc.clear();
                                    evc.setModelType(vfc.getListViewComponent().getModelType());
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

                                } else if (lastViewComponent instanceof JPACollectionFieldListViewComponent) {

                                    JPACollectionFieldListViewComponent cflvc = (JPACollectionFieldListViewComponent) lastViewComponent;

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

                                    EditorViewComponent evc = new EditorViewComponent(cflvc.getItem(step), null, hiddenFields);

                                    stack.push(currentPath, evc);


                                } else {

                                }
                            }

                        } else if (lastViewComponent instanceof EditorViewComponent || lastViewComponent instanceof FieldEditorComponent || lastViewComponent instanceof MethodResultViewFlowComponent || lastViewComponent instanceof WizardComponent || lastViewComponent instanceof OwnedCollectionComponent || lastViewComponent instanceof MethodParametersViewFlowComponent) {

                            IEditorViewComponent auxevfc = null;

                            MethodResultViewFlowComponent mrvfc = null;
                            if (lastViewComponent instanceof MethodResultViewFlowComponent) {
                                mrvfc = (MethodResultViewFlowComponent) lastViewComponent;
                                lastViewComponent = ((MethodResultViewFlowComponent) lastViewComponent).getComponent(0);
                                if (lastViewComponent instanceof MethodResultViewComponent) lastViewComponent = ((MethodResultViewComponent) lastViewComponent).getComponent(0);
                            }

                            if (lastViewComponent instanceof WizardComponent) {
                                auxevfc = ((WizardComponent) lastViewComponent).getEditorViewComponent();
                            } else if (lastViewComponent instanceof FieldEditorComponent) {
                                auxevfc = (IEditorViewComponent) ((FieldEditorComponent) lastViewComponent).getComponent(0);
                            } else if (lastViewComponent instanceof OwnedCollectionComponent) {
                                auxevfc = ((OwnedCollectionComponent) lastViewComponent).getEditorViewComponent();
                            } else if (lastViewComponent instanceof MethodParametersViewFlowComponent) {
                                auxevfc = ((MethodParametersViewFlowComponent)lastViewComponent).getComponent();
                            } else if (lastViewComponent instanceof MethodResultViewComponent) {
                            } else if (lastViewComponent instanceof EditorViewComponent) {
                                auxevfc = (EditorViewComponent) lastViewComponent;
                            }

                            IEditorViewComponent evfc = auxevfc;

                            Method method = null;
                            FieldInterfaced field = null;

                            if (auxevfc != null) {
                                method = evfc.getMethod(step);
                                field = evfc.getField(step);
                            } else if (lastViewComponent instanceof RpcListViewComponent) {
                                method = ReflectionHelper.getMethod(((RpcListViewComponent)lastViewComponent).getRpcListView().getClass(), step);
                            }

                            if (method == null && field == null && lastViewComponent instanceof RpcListViewComponent) {
                                if (pendingResult == null) {
                                    try {
                                        method = ((RpcListViewComponent)lastViewComponent).getRpcListView().getClass().getMethod("onEdit", String.class);
                                        try {
                                            pendingResult = method.invoke(((RpcListViewComponent)lastViewComponent).getRpcListView(), step);
                                        } catch (Throwable throwable) {
                                            MDD.alert(throwable);
                                        }
                                    } catch (NoSuchMethodException e) {
                                        MDD.alert(e);
                                    }
                                } else {
                                    if (pendingResult instanceof String) {
                                        try {
                                            method = ((RpcListViewComponent)lastViewComponent).getRpcListView().getClass().getMethod("onEdit", String.class);
                                        } catch (NoSuchMethodException e) {
                                            MDD.alert(e);
                                        }
                                        if (method == null) {
                                            method = ReflectionHelper.getMethod(((RpcListViewComponent)lastViewComponent).getRpcListView().getClass(), "onEdit");
                                        }
                                    } else {
                                        method = ReflectionHelper.getMethod(((RpcListViewComponent)lastViewComponent).getRpcListView().getClass(), "onEdit");
                                    }
                                }
                            }

                            if (method != null) {

                                callMethod(state, method, lastViewComponent instanceof RpcListViewComponent?((RpcListViewComponent)lastViewComponent).getRpcListView():evfc.getModel());

                            } else if (field != null) {


                                boolean ownedCollection = ReflectionHelper.isOwnedCollection(field);

                                if (field.isAnnotationPresent(UseLinkToListView.class)) {
                                    try {

                                        UseLinkToListView aa = field.getAnnotation(UseLinkToListView.class);

                                        {

                                            ListViewComponent lvc = null;
                                            Component vc = null;

                                            if (!Void.class.equals(aa.listViewClass())) {

                                                vc = lvc = new RpcListViewComponent(aa.listViewClass()).build();

                                            } else {

                                                if (field.isAnnotationPresent(ManyToOne.class)) {

                                                    lvc = new JPAListViewComponent(field.getType()).build();

                                                    vc = new CRUDViewComponent(lvc, new EditorViewComponent(field.getType()).build()).build();

                                                } else {

                                                    vc = lvc = new JPACollectionFieldListViewComponent(field.getGenericClass(), field, evfc).build();

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
                                                        System.out.println("Han seleccionado " + id);
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
                                        stack.push(currentPath, new OwnedCollectionComponent(evfc.getBinder(), field, field.isAnnotationPresent(UseLinkToListView.class)?-1:0));
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

                            if (evfc != null && evfc instanceof EditorViewComponent) currentEditor = (EditorViewComponent) evfc;

                        } else if (lastViewComponent instanceof MethodParametersViewFlowComponent) {

                            MethodParametersViewFlowComponent mpfvc = (MethodParametersViewFlowComponent) lastViewComponent;

                            MethodParametersViewComponent mpvc = mpfvc.getComponent();


                            System.out.println("aaaaa");


                        } else {
                            // step es el id de la vista

                            Class modelType = null;
                            try {

                                modelType = Class.forName(step);
                                CRUDViewComponent cv = new CRUDViewComponent(new JPAListViewComponent(modelType).build(), new EditorViewComponent(modelType).build()).build();

                                stack.push(currentPath, cv);

                            } catch (Exception e) {
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

        if (v != null && v instanceof io.mateu.mdd.vaadinport.vaadin.navigation.View && ((io.mateu.mdd.vaadinport.vaadin.navigation.View)v).getViewComponent() instanceof CRUDViewComponent) currentEditor = (EditorViewComponent) v.getViewComponent();

        if (v != null && v instanceof io.mateu.mdd.vaadinport.vaadin.navigation.View && ((io.mateu.mdd.vaadinport.vaadin.navigation.View)v).getComponent() instanceof CRUDViewComponent) Notification.show(((MDD.isMobile())?"Click":"Double click") + " on matches to edit", Notification.Type.TRAY_NOTIFICATION);

        if (v != null && v instanceof io.mateu.mdd.vaadinport.vaadin.navigation.View) {
            Component c = ((io.mateu.mdd.vaadinport.vaadin.navigation.View) v).getViewComponent();
            if (c != null && c instanceof ComponentWrapper) c = ((ComponentWrapper)c).getWrapped();
            if (c == null) {
                System.out.println("No limpiamos selección. c es null");
            } else if (c instanceof CRUDViewComponent) {
                System.out.println("Limpiamos selección " + ((CRUDViewComponent)c).getListViewComponent().resultsComponent.getGrid().getSelectedItems().size());
                ((CRUDViewComponent)c).getListViewComponent().resultsComponent.getGrid().getSelectionModel().deselectAll();
                System.out.println("Ha quedado en " + ((CRUDViewComponent)c).getListViewComponent().resultsComponent.getGrid().getSelectedItems().size());
            } else if (c instanceof ListViewComponent) {
                System.out.println("Limpiamos selección " + ((ListViewComponent)c).resultsComponent.getGrid().getSelectedItems().size());
                ((ListViewComponent)c).resultsComponent.getGrid().getSelectionModel().deselectAll();
                System.out.println("Ha quedado en " + ((ListViewComponent)c).resultsComponent.getGrid().getSelectedItems().size());
            } else {
                System.out.println("No limpiamos selección. clase = " + c.getClass().getName());
            }
        }

        return v;

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
                callMethod(state, method, Modifier.isStatic(method.getModifiers())?null:entityClass.newInstance());
            } catch (Exception e) {
                MDD.alert(e);
            }
        } else MDD.alert("Method " + methodName + " does not exist. Is it a typo?");
    }

    @Override
    public void callMethod(String state, Method method, Object instance) {
        if (method != null) {
            try {

                if (pendingResult != null) {

                    if (pendingResult.getClass().isAnnotationPresent(Entity.class) || PersistentPOJO.class.isAssignableFrom(pendingResult.getClass())) {
                        stack.push(currentPath, new EditorViewComponent(pendingResult));
                    } else {
                        try {
                            stack.push(currentPath, new MethodResultViewFlowComponent(state, method, pendingResult));
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    }
                    pendingResult = null;


                } else {

                    boolean hasNonInjectedParameters = false;

                    for (Parameter p : method.getParameters()) if (!ReflectionHelper.isInjectable(p)) {
                        hasNonInjectedParameters = true;
                        break;
                    }



                    if (hasNonInjectedParameters) {
                        stack.push(currentPath, new MethodParametersViewFlowComponent(currentPath, method, instance, this, null, pendingSelection));
                    } else {

                        if (Query.class.equals(method.getReturnType())) {

                            MDDUI.get().getNavegador().showResult(currentPath, method, ReflectionHelper.execute(MDD.getUserData(), method, new MDDBinder(new ArrayList<>()), instance, pendingSelection), this, false);

                        } else {

                            MDDUI.get().getNavegador().showResult(currentPath, method, ReflectionHelper.execute(MDD.getUserData(), method, new MDDBinder(new ArrayList<>()), instance, pendingSelection), this, false);

                        }
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


    public boolean isEditingNewRecord() {
        return currentEditor != null && currentEditor.isNewRecord();
    }
}
