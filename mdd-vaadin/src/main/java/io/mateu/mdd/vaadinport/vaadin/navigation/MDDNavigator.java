package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.google.common.base.Strings;
import com.vaadin.navigator.ViewChangeListener;
import com.vaadin.server.Page;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.*;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class MDDNavigator implements ViewChangeListener {

    private final FlowComponent flowComponent;
    private List<String> stepsInFlow = new ArrayList<>();

    private String currentState;


    public MDDNavigator(FlowComponent flowComponent) {
        this.flowComponent = flowComponent;
    }


    public String getPath(MenuEntry action, Class viewClass) {
        String u = MDD.getApp().getState(action);
        u += "/";
        u += viewClass.getName();
        return u;
    }

    public String getPath(MenuEntry action, Class viewClass, Object id) {
        //return getPath(action, viewClass) + "/" + ((id != null)?id:"add");
        return getPath(action) + "/" + ((id != null)?id:"add");
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

    public void go(String relativePath) {
        String path = currentState + "/" + relativePath;
        if (path != null && !path.equals(currentState)) {
            Page.getCurrent().open(((path.startsWith("/"))?"":"/") + path, Page.getCurrent().getWindowName());
        }
    }


    public void goTo(String path) {
        if (path != null && !path.equals(currentState)) {
            Page.getCurrent().open(((path.startsWith("/"))?"":"/") + path, Page.getCurrent().getWindowName());
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
        goTo(getPath(e));
    }

    public void goTo(AbstractArea area) {
        goTo(getPath(area));
    }

    private ViewComponent getComponentForState(String state) throws ClassNotFoundException, IllegalAccessException, InstantiationException {

        System.out.println("MDDNavigator.beforeViewChange: state=" + state);

        Class modelType = Class.forName(state.split("/")[3]);
        ViewComponent v = new CRUDViewComponent(new JPAListViewComponent(modelType).build(), new JPAEditorViewComponent(modelType).build()).build();

        return v;
    }

    @Override
    public boolean beforeViewChange(ViewChangeEvent viewChangeEvent) { // interceptamos porque no queremos proporcionar una clase, sino cargar una instancia concreta
        try {

            String state = viewChangeEvent.getViewName();

            System.out.println("MDDNavigator.beforeViewChange: state=" + state);

            if (!state.equals(currentState)) {


                String[] steps = state.split("/");

                String prefijo = "";

                int posInFlow = 0; // nos dice hasta que posición del flow podemos mantener
                while (posInFlow < steps.length
                        && posInFlow < stepsInFlow.size()
                        && stepsInFlow.get(posInFlow).equals(steps[posInFlow])) {
                    if (!"".equals(prefijo)) prefijo += "/";
                    prefijo += steps[posInFlow];
                    posInFlow++;
                }

                if (posInFlow > 0) {
                    flowComponent.popTo(posInFlow - 1); // retrocedemos al punto de partida común
                    while (stepsInFlow.size() > posInFlow) stepsInFlow.remove(stepsInFlow.size() - 1);
                }


                //public
                //login
                //private
                //private|public/area
                //private|public/modulo
                //private|public/modulo/menu
                //private|public/modulo/menu/menu
                //private|public/modulo/menu/menu/accion
                //private|public/modulo/menu/menu/accion/vista
                //private|public/modulo/menu/menu/accion/vista/filters
                //private|public/modulo/menu/menu/accion/vista/staticMethodName
                //private|public/modulo/menu/menu/accion/vista/add
                //private|public/modulo/menu/menu/accion/vista/id
                //private|public/modulo/menu/menu/accion/vista/id|add/view/id <-- abrir registro relacionado
                //private|public/modulo/menu/menu/accion/vista/id|add/field <-- rellenar editando lista inline
                //private|public/modulo/menu/menu/accion/vista/id|add/field <-- rellenar seleccionado registros
                //private|public/modulo/menu/menu/accion/vista/id|add/methodName <-- rellenar seleccionado registros



                 if (Strings.isNullOrEmpty(state)) {
                    goTo((MDD.getApp().isAuthenticationNeeded())?"login":"public");
                } else {

                    if (flowComponent.getStackSize() >= steps.length && state.equals(flowComponent.getComponentInStack(steps.length - 1).getStatePath())) {

                    } else {

                        while (posInFlow < steps.length) { //vamos completando
                            String step = steps[posInFlow];

                            FlowViewComponent lastFlowComponent = null;
                            if (flowComponent.getStackSize() > 0)
                                lastFlowComponent = flowComponent.getComponentInStack(flowComponent.getStackSize() - 1);

                            boolean procesar = false;

                            if (
                                    lastFlowComponent != null
                                            && !(lastFlowComponent instanceof PublicMenuFlowComponent)
                                            && !(lastFlowComponent instanceof PrivateMenuFlowComponent)
                                            && !(lastFlowComponent instanceof AreaFlowComponent)
                                            && !(lastFlowComponent instanceof ModuleFlowComponent)
                                    ) {
                                if (
                                        !(lastFlowComponent instanceof MenuFlowComponent)
                                                || MDD.getApp().getMenu(prefijo + "/" + step) == null
                                        ) {
                                    procesar = true;
                                }
                            }

                            if (procesar) {
                                // miramos el último componente añadido

                                if (lastFlowComponent instanceof CrudViewFlowComponent || lastFlowComponent instanceof  ListViewFlowComponent) { // el último fué una listView, estamos en un id, add, o en los filtros

                                    ListViewComponent lvc = null;
                                    if (lastFlowComponent instanceof CrudViewFlowComponent) {
                                        CrudViewFlowComponent vfc = (CrudViewFlowComponent) lastFlowComponent;
                                        lvc = vfc.getCrudViewComponent().getListViewComponent();
                                    } else if (lastFlowComponent instanceof ListViewFlowComponent) {
                                        lvc = ((ListViewFlowComponent) lastFlowComponent).getListViewComponent();
                                    }



                                    // step es filters, add o el id del objeto a editar

                                    Method method = lvc.getMethod(step);

                                    if (method != null) {

                                        flowComponent.push(new MethodParametersViewFlowComponent(state, method, null));

                                    } else if ("filters".equals(step)) {

                                        flowComponent.push(new FiltersViewFlowComponent(state, lvc));

                                    } else {

                                        if (lastFlowComponent instanceof CrudViewFlowComponent) {
                                            CrudViewFlowComponent vfc = (CrudViewFlowComponent) lastFlowComponent;

                                            EditorViewComponent evc = vfc.getCrudViewComponent().getEditorViewComponent();

                                            try {

                                                if (Strings.isNullOrEmpty(step) || "add".equals(step)) { // estamos añadiendo un nuevo registro
                                                    evc.load(null);
                                                } else { // step es el id del objeto a editar
                                                    String sid = step;
                                                    evc.load(vfc.getCrudViewComponent().getListViewComponent().deserializeId(sid));
                                                }

                                            } catch (Throwable throwable) {
                                                throwable.printStackTrace();
                                            }

                                            flowComponent.push(new EditorViewFlowComponent(state, evc));

                                        } else {

                                        }
                                    }

                                } else if (lastFlowComponent instanceof EditorViewFlowComponent) {

                                    EditorViewFlowComponent evfc = (EditorViewFlowComponent) lastFlowComponent;

                                    Method method = evfc.getEditorViewComponent().getMethod(step);

                                    if (method != null) {

                                        flowComponent.push(new MethodParametersViewFlowComponent(state, method, evfc.getEditorViewComponent().getModel()));

                                    }

                                } else {
                                    // step es el id de la vista

                                    Class modelType = null;
                                    try {

                                        modelType = Class.forName(step);
                                        CRUDViewComponent v = new CRUDViewComponent(new JPAListViewComponent(modelType).build(), new JPAEditorViewComponent(modelType).build()).build();

                                        flowComponent.push(new CrudViewFlowComponent(state, v));

                                    } catch (ClassNotFoundException e) {
                                        e.printStackTrace();
                                    } catch (IllegalAccessException e) {
                                        e.printStackTrace();
                                    } catch (InstantiationException e) {
                                        e.printStackTrace();
                                    }


                                    //crud.loadInEditor(sid);


                                }

                            } else if (posInFlow > 2) { // el id del menu
                                MenuEntry e = MDD.getApp().getMenu(prefijo + "/" + step);
                                if (e instanceof AbstractAction) {
                                    ((AbstractAction) e).run(flowComponent);
                                } else if (e instanceof AbstractMenu) {
                                    flowComponent.push(new MenuFlowComponent(state, (AbstractMenu) e));
                                }
                            } else if (posInFlow == 2) { // public | private --> lista de areas
                                flowComponent.push(new ModuleFlowComponent(state, MDD.getApp().getModule(prefijo + "/" + step)));
                            } else if (posInFlow == 1) { // public | private --> lista de areas
                                flowComponent.push(new AreaFlowComponent(state, MDD.getApp().getArea(prefijo + "/" + step)));
                            } else if (posInFlow == 0) { // acción básica
                                if ("public".equalsIgnoreCase(step))
                                    flowComponent.push(new PublicMenuFlowComponent(state));
                                else if ("login".equalsIgnoreCase(step))
                                    flowComponent.push(new LoginFlowComponent(state));
                            }

                            stepsInFlow.add(step);
                            posInFlow++;
                            if (!"".equals(prefijo)) prefijo += "/";
                            prefijo += step;
                        }
                    }
                }

                flowComponent.showLast();

                currentState = state;
            }


        } finally {

        }

        return true;
    }

    @Override
    public void afterViewChange(ViewChangeEvent event) {

    }

    public void goTo(FieldInterfaced f) {
        String state = currentState;
        state += "/" + f.getName();
        goTo(state);
    }

    public void goTo(Method m) {
        String state = currentState;
        state += "/" + m.getName();
        goTo(state);
    }

    public void goTo(Object id) {
        String state = currentState;
        if (!state.endsWith("/" + id)) {
            if (state.endsWith("/add")) state = state.substring(0, state.length() - "add".length());
            if (!state.endsWith("/")) state += "/";
            state += id;
        }
        goTo(state);
    }

    public void goBack() {
        String u = Page.getCurrent().getLocation().getPath();
        u = u.substring(0, u.lastIndexOf("/"));
        MyUI.get().getNavegador().goTo(u);
    }

    public void showResult(Method m, Object r) {
        String state = currentState;
        if (!state.endsWith("/")) state += "/";
        state += "result";

        flowComponent.push(new MethodResultViewFlowComponent(state, m, r));
        stepsInFlow.add("result");

        goTo(state);
    }
}
