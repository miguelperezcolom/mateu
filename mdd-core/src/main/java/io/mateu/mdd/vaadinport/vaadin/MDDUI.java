package io.mateu.mdd.vaadinport.vaadin;

import com.google.common.base.Strings;
import com.vaadin.annotations.*;
import com.vaadin.navigator.Navigator;
import com.vaadin.navigator.PushStateNavigation;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinServletRequest;
import com.vaadin.ui.Component;
import com.vaadin.ui.JavaScriptFunction;
import com.vaadin.ui.Layout;
import com.vaadin.ui.UI;
import elemental.json.JsonArray;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.MDDPort;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.components.app.AppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.desktop.DesktopAppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.mobile.MobileAppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.mobile.ViewContainer;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.mdd.VaadinPort;
import io.mateu.mdd.vaadinport.vaadin.navigation.*;
import lombok.extern.slf4j.Slf4j;

import java.net.URI;

/**
 * This UI is the application entry point. A UI may either represent a browser window 
 * (or tab) or some part of an HTML page where a Vaadin application is embedded.
 * <p>
 * The UI is initialized using {@link #init(VaadinRequest)}. This method is intended to be 
 * overridden to add component to the user interface and initialize non-component functionality.
 */
@Theme("mytheme")

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

@StyleSheet("https://use.fontawesome.com/releases/v5.5.0/css/all.css")

//@StyleSheet("https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.min.css")
@Viewport("width=device-width, initial-scale=1")
@PushStateNavigation // para urls sin #!
//@Push // lo comentamos porque no funciona en Heroku
@PreserveOnRefresh
@Slf4j
public class MDDUI extends UI {

    private MDDNavigator navegador;
    private Navigator navigator;
    private ViewStack stack;
    private ViewContainer viewContainer;


    private AppComponent appComponent;
    private AbstractApplication app;
    private VaadinPort port;

    public boolean isEditingNewRecord() {
        return navegador.getViewProvider().isEditingNewRecord();
    }

    public AbstractApplication getApp() {
        return app;
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
        String sp = ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getServletPath();
        if (sp.startsWith("/")) sp = sp.substring(1);
        contextUrl += sp;
        if (!contextUrl.endsWith("/")) contextUrl += "/";

        if (Strings.isNullOrEmpty(System.getProperty("tmpurl"))) {
            System.setProperty("tmpurl", contextUrl + "tmp");
            System.setProperty("tmpdir", ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getServletContext().getRealPath("/tmp/"));
        }

        port = new VaadinPort(vaadinRequest);

        if (app == null) {

            app = createApp();

            if (MDD.getClassPool() == null) MDD.setClassPool(ReflectionHelper.createClassPool(((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getServletContext()));

            app.buildAreaAndMenuIds();

        }

        if (Strings.isNullOrEmpty(app.getBaseUrl())) {
            app.setBaseUrl(System.getProperty("baseurl", contextUrl));
            log.debug("baseurl=" + app.getBaseUrl());
        }


        viewContainer = createViewContainer();


        addNavigator();

        //setContent(flowComponent);

        setContent((Component) (appComponent = (MDD.getPort().isMobile())?new MobileAppComponent(app, viewContainer):new DesktopAppComponent(app, viewContainer)));

    }

    private String getBaseUrl() {
        URI u = getPage().getLocation();
        String s = u.getScheme() + "://" + u.getHost() + ((u.getPort() != 80)?":" + u.getPort():"") + "/";
        return s;
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
        return (MDDUI) UI.getCurrent();
    }



    private void addNavigator() {

        navigator = new Navigator(this, viewContainer);

        stack = stack = new ViewStack();
        MDDViewProvider viewProvider = new MDDViewProvider(stack);

        navegador = new MDDNavigator(stack, navigator, viewProvider);

        VoidView voidView = new VoidView(stack);
        navigator.addProvider(viewProvider);

    }


    public MDDNavigator getNavegador() {
        return navegador;
    }

    public MDDPort getPort() {
        return port;
    }

    public void refreshUI() {
        View v = stack.getLast();

        if (v != null && v.getComponent() != null && v.getComponent() instanceof EditorViewComponent) {
            EditorViewComponent evc = (EditorViewComponent) v.getComponent();
            evc.getBinder().refresh();
        }

    }
}
