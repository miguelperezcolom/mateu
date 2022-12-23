package io.mateu.mdd.vaadin.controllers.firstLevel;

import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MDDOpenHtml;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.pojos.PrivateHome;
import io.mateu.mdd.shared.pojos.PublicHome;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.HomeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.FakeComponent;
import io.mateu.mdd.vaadin.controllers.BrokenLinkController;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.views.ComponentView;
import io.mateu.util.notification.Notifier;

public class HomeController extends Controller {

    private final boolean privada;
    private final App app;

    public HomeController(boolean privada) {
        this.privada = privada;
        this.app = MDDUIAccessor.getApp();
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (app.isAuthenticationNeeded()) {
            return new PrivateHome();
        }

        if ("private".equals(step)) {
            if (app.getDefaultPrivateArea() != null) {
                MenuEntry home = app.getDefaultPrivateArea() != null?app.getDefaultPrivateArea().getDefaultAction():null;
                if (home != null) {
                    return home;
                } else {
                    // si no, seguir hacia el área por defecto
                    return app.getDefaultPrivateArea();
                }
            }
        } else if ("public".equals(step)) {
            MenuEntry home = app.getDefaultPublicArea() != null?app.getDefaultPublicArea().getDefaultAction():null;
            if (home != null) {
                return home;
            } else {
                // si no, seguir hacia el área por defecto
                return app.getDefaultPublicArea();
            }
        }

        return new PublicHome();
    }
}
