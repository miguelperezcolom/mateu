package io.mateu.mdd.vaadin;

import com.google.common.base.Strings;
import com.vaadin.annotations.JavaScript;
import com.vaadin.annotations.*;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.navigator.Navigator;
import com.vaadin.navigator.PushStateNavigation;
import com.vaadin.navigator.ViewChangeListener;
import com.vaadin.server.Page;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinServletRequest;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import elemental.json.JsonArray;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;
import io.mateu.mdd.shared.ui.IMDDUI;
import io.mateu.mdd.vaadin.components.app.AppComponent;
import io.mateu.mdd.vaadin.components.app.ViewContainer;
import io.mateu.mdd.vaadin.components.fieldBuilders.AbstractFieldBuilder;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.views.SearchInMenuComponent;
import io.mateu.mdd.vaadin.mdd.VaadinPort;
import io.mateu.mdd.vaadin.navigation.MDDNavigator;
import io.mateu.mdd.vaadin.navigation.MDDViewProvider;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Method;
import java.net.URI;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;

/**
 * This UI is the application entry point. A UI may either represent a browser window 
 * (or tab) or some part of an HTML page where a Vaadin application is embedded.
 * <p>
 * The UI is initialized using {@link #init(VaadinRequest)}. This method is intended to be 
 * overridden to add component to the user interface and initialize non-component functionality.
 */
@Theme("mateumddtheme")

//@Widgetset("com.vaadin.WidgetSet")

//<link href="//cdn.muicss.com/mui-0.9.39/css/mui.min.css" rel="stylesheet" type="text/css" />
//<script src="//cdn.muicss.com/mui-0.9.39/js/mui.min.js"></script>

//@StyleSheet("//cdn.muicss.com/mui-0.9.39/css/mui.min.css")
//@JavaScript("//cdn.muicss.com/mui-0.9.39/js/mui.min.js")

//<script
//  src="https://code.jquery.com/jquery-3.4.1.min.js"
//  integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
//  crossorigin="anonymous"></script>
@JavaScript({"https://code.jquery.com/jquery-3.4.1.min.js"})
@StyleSheet("https://use.fontawesome.com/releases/v5.13.0/css/all.css")



//@JavaScript({"https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.js"})
//@StyleSheet("https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.css")

//<script src='https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.js'></script>
//<link href='https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.css' rel='stylesheet' />

//@StyleSheet("https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.min.css")
@Viewport("width=device-width, initial-scale=1")
@PushStateNavigation // para urls sin #!
//@Push
@PreserveOnRefresh
@Slf4j
public class MDDUI extends UI implements IMDDUI {

    private MDDNavigator navegador;
    private Navigator navigator;
    private ViewStack stack;
    private ViewContainer viewContainer;


    private AppComponent appComponent;
    private AbstractApplication app;
    private VaadinPort port;
    private String baseUrl;


    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    @Override
    public void clearStack() {
        getNavegador().getViewProvider().clearStack();
    }

    @Override
    public String getPath(MenuEntry e) {
        return getNavegador().getPath(e);
    }

    public String _getBaseUrl() {
        URI u = getPage().getLocation();
        String s = u.getScheme() + "://" + u.getHost() + ((u.getPort() != 80)?":" + u.getPort():"") + "/";
        return s;
    }

    public ViewContainer getViewContainer() {
        return viewContainer;
    }

    public boolean isEditingNewRecord() {
        return navegador.getViewProvider().isEditingNewRecord();
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

    public void openListView(Class listViewClass) throws Exception {
        getNavegador().getViewProvider().openListView(listViewClass);
    }

    public void callMethod(String state, Method method, Object instance, Component lastViewComponent) {
        getNavegador().getViewProvider().callMethod(null, method, null, null);
    }

    public void setPendingResult(Object o) {
        getNavegador().getViewProvider().pendingResult = o;
    }

    public AbstractApplication getApp() {
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
        return ListViewComponent.getColumnFields(targetType);
    }

    @Override
    public void updateTitle(String title) {
        get().getPort().updateTitle(title);
    }

    @Override
    public boolean isMobile() {
        return getPort().isMobile();
    }

    @Override
    public String getCurrentState() {
        return getNavigator().getCurrentNavigationState();
    }

    @Override
    public void go(String relativePath) {
        getNavegador().go(relativePath);
    }

    @Override
    public void goTo(String path) {
        getNavegador().goTo(path);
    }

    @Override
    public void goBack() {
        getNavegador().goBack();
    }

    @Override
    public void goSibling(Object siblingId) {
        //todo: implementar
    }

    @Override
    public void open(Method m, Set selection) {
        //todo: implementar
    }

    @Override
    public void open(Method m, Object result) {
        //todo: implementar
    }

    @Override
    public Set getPendingSelection() {
        return null;
    }

    @Override
    public void setPendingSelection(Set selecion) {

    }

    @Override
    public Object getPendingResult() {
        return null;
    }

    public void setApp(AbstractApplication app) {
        this.app = app;
    }

    public AppComponent getAppComponent() {
        return appComponent;
    }

    @Override
    protected void init(VaadinRequest vaadinRequest) {

        com.vaadin.ui.JavaScript.getCurrent().addFunction("pingserver", new JavaScriptFunction() {
            @Override
            public void call(JsonArray jsonArray) {
                Layout l = (Layout) appComponent;
                if (l.getStyleName().contains("xxxxxx")) l.removeStyleName("xxxxxx");
                else l.addStyleName("xxxxxx");
            }
        });


        String url = ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getRequestURL().toString();
        String uri = ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getRequestURI();

        String contextUrl = url.substring(0, url.length() - uri.length());
        contextUrl += ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getContextPath();
        if (!contextUrl.endsWith("/")) contextUrl += "/";
        /*
        String sp = ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getServletPath();
        if (sp.startsWith("/")) sp = sp.substring(1);
        contextUrl += sp;
        if (!contextUrl.endsWith("/")) contextUrl += "/";
         */

        if (Strings.isNullOrEmpty(System.getProperty("tmpurl"))) {
            System.setProperty("tmpurl", contextUrl + "tmp");
            System.setProperty("tmpdir", ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getServletContext().getRealPath("/tmp/"));
        }

        port = new VaadinPort(vaadinRequest);

        setBaseUrl(System.getProperty("baseurl", contextUrl));

        viewContainer = createViewContainer();

        addNavigator();


        if (app == null) {
            AbstractApplication appFromContext = (AbstractApplication) ((VaadinServletRequest) vaadinRequest).getServletContext().getAttribute((Strings.isNullOrEmpty(getUiRootPath())?"/": getUiRootPath()) + "_app");
            setApp(appFromContext != null?appFromContext:createApp());

            if (MDD.getClassPool() == null) MDD.setClassPool(ReflectionHelper.createClassPool(((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getServletContext()));

            app.buildAreaAndMenuIds();

        }

        //setContent(flowComponent);


    }


    public static AbstractApplication createApp() {
        return AbstractApplication.get();
    }

    private ViewContainer createViewContainer() {
        return new ViewContainer();
    }


    @Override
    protected void refresh(VaadinRequest request) {
        super.refresh(request);
        String state = getPage().getLocation().getPath();
        if (state.startsWith("/")) state = state.substring(1);
        if (state.startsWith("app")) state = state.substring("app".length());
        if (state.startsWith("/")) state = state.substring(1);
        log.debug("MDDUI.refresh: new state = " + state);
        navigator.navigateTo(state);
    }


/*
    @WebServlet(urlPatterns = "/*", name = "MyUIServlet", asyncSupported = true, loadOnStartup = 1000)
    @VaadinServletConfiguration(ui = MDDUI.class, productionMode = false)
    public static class MyUIServlet extends VaadinServlet {

    }
*/



    public static MDDUI get() {
        UI ui = UI.getCurrent();
        return ui != null && ui instanceof MDDUI ? (MDDUI) ui :null;
    }



    private void addNavigator() {

        navigator = new Navigator(this, viewContainer);
        navigator.addViewChangeListener(new ViewChangeListener() {
            @Override
            public boolean beforeViewChange(ViewChangeEvent viewChangeEvent) {

                return true;
            }

            @Override
            public void afterViewChange(ViewChangeEvent event) {
                // Execute JavaScript in the currently processed page
                String t = getApp().getName();
                if (event.getNewView() != null && event.getNewView() instanceof View) {
                    View v = (View) event.getNewView();
                    t = v.getViewComponent().getPageTitle();
                } else t = event.getNewView().toString();
                //Page.getCurrent().setTitle(t);
                //Page.getCurrent().getJavaScript().execute("setTimeout(function() { document.title = '" + t + "';}, 1)");
                Page.getCurrent().getJavaScript().execute("document.title = '" + t + "';");
                //setTimeout(function() { your_func(); }, 5000);
            }
        });

        stack = new ViewStack();
        MDDViewProvider viewProvider = new MDDViewProvider(stack);

        navegador = new MDDNavigator(stack, navigator, viewProvider);

        navigator.addProvider(viewProvider);

    }


    public MDDNavigator getNavegador() {
        return navegador;
    }

    public VaadinPort getPort() {
        return port;
    }

    public void refreshUI() {
        View v = stack.getLast();

        if (v != null && v.getComponent() != null && v.getComponent() instanceof EditorViewComponent) {
            EditorViewComponent evc = (EditorViewComponent) v.getComponent();
            evc.getBinder().refresh();
        }

    }

    public void chooseArea(boolean publicZone) {
        //abrir ventana modal con todas las áreas
        Window w = new Window("Please select work area");

        w.addStyleName("miapp");

        w.setWidth("80%");
        w.setHeight("80%");

        CssLayout lx = new CssLayout();
        lx.addStyleName("selectarea");

        getAppComponent().setSelectingArea();

        for (IArea a : getApp().getAreas()) {
            Button b;
            lx.addComponent(b = new Button(a.getName(), VaadinIcons.ADOBE_FLASH.equals(a.getIcon())?null:a.getIcon()));
            b.addClickListener(e -> {
                w.close();
                getNavegador().goTo(a);
            });
            b.setPrimaryStyleName(ValoTheme.BUTTON_HUGE);
            b.addStyleName("submenuoption");
        };


        w.setContent(lx);

        w.center();
        w.setModal(true);

        UI.getCurrent().addWindow(w);

    }

    public void search() {
        // lo mismo para buscar y para navegar en profundidad
        Window w = new Window("Search");

        w.addStyleName("miapp");

        w.setWidth("80%");
        w.setHeight("80%");

        SearchInMenuComponent c = new SearchInMenuComponent(getApp().getSearcher()) {

            @Override
            public VaadinIcons getIcon() {
                return null;
            }

            @Override
            public void close() {
                w.close();
            }
        };

        w.setContent(c);

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

    public void openInWindow(AbstractViewComponent view) {
        // lo mismo para buscar y para navegar en profundidad
        Window w = new Window(view.getCaption());

        w.addStyleName("miapp");

        int percent = 100 - (UI.getCurrent().getWindows().size() + 1) * 5;

        w.setWidth("" + percent + "%");
        w.setHeight("" + percent + "%");

        w.setContent(view);

        w.center();
        w.setModal(true);

        w.addCloseListener(e -> {
        });

        UI.getCurrent().addWindow(w);
    }

    public void openInWindow(View view) {
        // lo mismo para buscar y para navegar en profundidad
        Window w = new Window(view.getViewComponent().getCaption());

        w.addStyleName("miapp");

        int percent = 100 - (UI.getCurrent().getWindows().size() + 1) * 5;

        w.setWidth("" + percent + "%");
        w.setHeight("" + percent + "%");

        w.setContent(view.getViewComponent());
        view.setWindowContainer(w);

        w.center();
        w.setModal(true);

        w.addCloseListener(e -> {
           if (!"noback".equals(w.getData())) getNavegador().goBack();
           int pos = getNavegador().getStack().indexOf(view);
           if (pos > 0) {
               Component c = getNavegador().getStack().get(pos - 1).getViewComponent();
               if (c.getStyleName().contains("refreshOnBack")) {
                   if (c instanceof ListViewComponent) {
                       try {
                           ((ListViewComponent) c).search(((ListViewComponent) c).getModelForSearchFilters());
                       } catch (Throwable throwable) {
                           Notifier.alert(throwable);
                       }
                   } else if (c instanceof EditorViewComponent) {
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
           }

        });

        UI.getCurrent().addWindow(w);
    }

    public <F, C> void search(RpcView<F, C> view) {
        getNavegador().getViewProvider().search(view);
    }
}
