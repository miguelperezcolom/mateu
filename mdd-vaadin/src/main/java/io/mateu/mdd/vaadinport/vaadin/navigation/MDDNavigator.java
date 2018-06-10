package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.google.common.base.Strings;
import com.vaadin.navigator.Navigator;
import com.vaadin.navigator.ViewChangeListener;
import com.vaadin.ui.UI;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.vaadinport.vaadin.components.app.AppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.*;

public class MDDNavigator implements ViewChangeListener {

    private final AppComponent appComponent;
    private final Navigator navigator;

    private ViewComponent currentViewComponent;
    private String currentState;
    private String currentStateHeader;


    public MDDNavigator(AppComponent appComponent, Navigator navigator) {
        this.appComponent = appComponent;
        this.navigator = navigator;
    }


    public String getPath(AbstractAction action, Class viewClass) {
        String u = "mdd/";
        u += appComponent.getApp().getState(action);
        u += "/";
        u += viewClass.getName();
        return u;
    }

    public String getPath(AbstractAction action, Class viewClass, Object id) {
        return getPath(action, viewClass) + "/" + ((id != null)?id:"add");
    }

    public String getPath(MenuEntry e) {
        String u = "mdd/";
        u += appComponent.getApp().getState(e);
        return u;
    }

    public String getPath(AbstractArea area) {
        String u = "mdd/";
        u += appComponent.getApp().getState(area);
        return u;
    }



    public void goTo(String path) {
        if (path != null && !path.equals(currentState)) navigator.navigateTo(path);
        //Page.getCurrent().open(path, (event.isAltKey() || event.isCtrlKey())?"_blank":Page.getCurrent().getWindowName()
    }

    private ViewComponent getComponentForState(String state) throws ClassNotFoundException, IllegalAccessException, InstantiationException {

        System.out.println("MDDNavigator.beforeViewChange: state=" + state);

        Class modelType = Class.forName(state.split("/")[3]);
        ViewComponent v = new CRUDViewComponent(new JPAListViewComponent(modelType).build(), new JPAEditorViewComponent(modelType).build()).build();
        v.setOriginatingAction((AbstractAction) appComponent.getApp().getMenu(state.split("/")[2]));

        return v;
    }

    @Override
    public boolean beforeViewChange(ViewChangeEvent viewChangeEvent) {
        try {

            String state = viewChangeEvent.getViewName();

            System.out.println("MDDNavigator.beforeViewChange: state=" + state);

            if (!state.equals(currentState)) {


                // mdd/area/menu/vista/id

                if (!Strings.isNullOrEmpty(state)) {
                    String stateHeader = "";
                    String[] ts = state.split("/");
                    stateHeader += ts[1];
                    if (ts.length > 2) {
                        stateHeader += "/";
                        stateHeader += ts[2];
                        if (ts.length > 3) {
                            stateHeader += "/";
                            stateHeader += ts[3];
                        }
                    }

                    String areaId = "";
                    String menuId = "";
                    areaId += ts[1];
                    if (ts.length > 2) {
                        menuId += ts[2];
                    }



                    if (ts.length == 2) { // es una area


                        if ("searchinmenu".equalsIgnoreCase(ts[1])) {

                            currentViewComponent = new SearchInMenuComponent(appComponent.getApp().getMenu(menuId)).build();
                            appComponent.open(currentViewComponent);
                            currentStateHeader = stateHeader;

                        } else {

                            currentViewComponent = new AreaComponent(appComponent.getApp().getArea(menuId)).build();
                            appComponent.open(currentViewComponent);
                            currentStateHeader = stateHeader;

                        }

                    } else if (ts.length == 3) { // es un menu

                        if ("change".equalsIgnoreCase(ts[2])) {
                            currentViewComponent = new ChangeAreaComponent(appComponent.getApp().getArea(menuId)).build();
                            appComponent.open(currentViewComponent);
                            currentStateHeader = stateHeader;
                        } else {
                            currentViewComponent = new ShowMenuComponent(appComponent.getApp().getMenu(menuId)).build();
                            appComponent.open(currentViewComponent);
                            currentStateHeader = stateHeader;
                        }

                    } else {

                        CRUDViewComponent crud = null;

                        if (stateHeader.equals(currentStateHeader)) {

                            if (currentViewComponent == null) {
                                currentViewComponent = getComponentForState(state);
                                appComponent.open(currentViewComponent);
                            }

                        } else {
                            currentViewComponent = getComponentForState(state);
                            appComponent.open(currentViewComponent);

                            currentStateHeader = stateHeader;
                        }

                        if (currentViewComponent instanceof CRUDViewComponent) crud = (CRUDViewComponent) currentViewComponent;

                        if (crud != null) {
                            if (ts.length > 4) {
                                String sid = ts[4];
                                try {

                                    crud.loadInEditor(sid);

                                } catch (Throwable throwable) {
                                    MDD.alert(throwable);
                                }
                            } else {
                                crud.showList();
                            }
                        }

                    }

                } else {
                    appComponent.clear();
                    currentStateHeader = "";
                }

                currentState = state;
            }


        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        }

        return true;
    }

    @Override
    public void afterViewChange(ViewChangeEvent event) {

    }

}
