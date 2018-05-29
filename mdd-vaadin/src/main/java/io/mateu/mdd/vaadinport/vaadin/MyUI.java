package io.mateu.mdd.vaadinport.vaadin;

import javax.servlet.annotation.WebServlet;

import com.vaadin.annotations.Theme;
import com.vaadin.annotations.VaadinServletConfiguration;
import com.vaadin.annotations.Viewport;
import com.vaadin.server.Responsive;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinServlet;
import com.vaadin.ui.UI;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.interfaces.App;
import io.mateu.mdd.vaadinport.vaadin.components.app.AppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.JPAListViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.ViewComponent;
import io.mateu.mdd.vaadinport.vaadin.mdd.VaadinPort;

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
@Viewport("width=device-width, initial-scale=1")
public class MyUI extends UI {

    private AppComponent appComponent;

    @Override
    protected void init(VaadinRequest vaadinRequest) {

        Iterator<App> apps = ServiceLoader.load(App.class).iterator();
        AbstractApplication app = null;
        while (apps.hasNext()) {
            app = (AbstractApplication) apps.next();
            System.out.println("app " + app.getName() + " loaded");
            break;
        }

        MDD.setPort(new VaadinPort());


        setContent(appComponent = new AppComponent(app));
    }

    public void open(ViewComponent viewComponent) {
        appComponent.open(viewComponent);
    }

    @WebServlet(urlPatterns = "/*", name = "MyUIServlet", asyncSupported = true)
    @VaadinServletConfiguration(ui = MyUI.class, productionMode = false)
    public static class MyUIServlet extends VaadinServlet {
    }
}
