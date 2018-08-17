package io.mateu.mdd.vaadinport.vaadin;

import com.google.common.base.Strings;
import com.vaadin.annotations.*;
import com.vaadin.navigator.Navigator;
import com.vaadin.navigator.PushStateNavigation;
import com.vaadin.server.Page;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinServlet;
import com.vaadin.server.VaadinServletRequest;
import com.vaadin.shared.communication.PushMode;
import com.vaadin.ui.Layout;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.BaseMDDApp;
import io.mateu.mdd.core.interfaces.App;
import io.mateu.mdd.vaadinport.vaadin.components.app.old.AppComponent;
import io.mateu.mdd.vaadinport.vaadin.mdd.VaadinPort;
import io.mateu.mdd.vaadinport.vaadin.navigation.MDDNavigator;
import io.mateu.mdd.vaadinport.vaadin.navigation.MDDViewProvider;
import io.mateu.mdd.vaadinport.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadinport.vaadin.navigation.VoidView;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import java.util.Iterator;
import java.util.ServiceLoader;

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

@StyleSheet("//cdn.muicss.com/mui-0.9.39/css/mui.min.css")
@JavaScript("//cdn.muicss.com/mui-0.9.39/js/mui.min.js")

//@StyleSheet("https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.min.css")
@Viewport("width=device-width, initial-scale=1")
@PushStateNavigation // para urls sin #!
@Push(PushMode.MANUAL)
@PreserveOnRefresh
public class MyUI extends UI {

    private MDDNavigator navegador;
    private Navigator navigator;
    private ViewStack stack;
    private Layout viewContainer;


    private AppComponent appComponent;
    private AbstractApplication app;

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


        boolean mobile = Page.getCurrent().getWebBrowser().isAndroid() || Page.getCurrent().getWebBrowser().isIOS() || Page.getCurrent().getWebBrowser().isWindowsPhone();

        if (vaadinRequest instanceof VaadinServletRequest) {
            HttpServletRequest httpRequest = ((VaadinServletRequest) vaadinRequest).getHttpServletRequest();
            String userAgent = httpRequest.getHeader("User-Agent").toLowerCase();
            if (userAgent.contains("ipad")) { //... }
               mobile = false;
            }
        }



        if (Strings.isNullOrEmpty(System.getProperty("tmpurl"))) {
            String url = ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getRequestURL().toString();
            String uri = ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getRequestURI();

            String contextUrl = url.substring(0, url.length() - uri.length());
            contextUrl += ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getContextPath();

            if (!contextUrl.endsWith("/")) contextUrl += "/";

            System.setProperty("tmpurl", contextUrl + "tmp");
            System.setProperty("tmpdir", ((VaadinServletRequest)vaadinRequest).getHttpServletRequest().getServletContext().getRealPath("/tmp/"));
        }


        Iterator<App> apps = ServiceLoader.load(App.class).iterator();
        app = null;
        while (apps.hasNext()) {
            app = (AbstractApplication) apps.next();
            System.out.println("app " + app.getName() + " loaded");
            break;
        }

        MDD.setPort(new VaadinPort());

        MDD.setApp((BaseMDDApp) app);

        app.buildAreaAndMenuIds();

        viewContainer = createViewContainer();


        addNavigator();



        //setContent(flowComponent);

        setContent(appComponent = new AppComponent(app, viewContainer));

    }

    private Layout createViewContainer() {
        VerticalLayout l = new VerticalLayout();
        l.addStyleName("viewcontainer");
        l.setSizeFull();
        return l;
    }


    @Override
    protected void refresh(VaadinRequest request) {
        super.refresh(request);
        String state = getPage().getLocation().getPath();
        if (state.startsWith("/")) state = state.substring(1);
        System.out.println("MyUI.refresh: new state = " + state);
        navigator.navigateTo(state);
    }



    @WebServlet(urlPatterns = "/*", name = "MyUIServlet", asyncSupported = true, loadOnStartup = 1000)
    @VaadinServletConfiguration(ui = MyUI.class, productionMode = false)
    public static class MyUIServlet extends VaadinServlet {

    }




    public static MyUI get() {
        return (MyUI) UI.getCurrent();
    }



    private void addNavigator() {


        navigator = new Navigator(this, viewContainer);
        navegador = new MDDNavigator(stack = new ViewStack(), navigator);

        VoidView voidView = new VoidView();
        navigator.addProvider(new MDDViewProvider(stack));

    }


    public MDDNavigator getNavegador() {
        return navegador;
    }
}
