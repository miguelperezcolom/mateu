package io.mateu.mdd.vaadin.controllers.zeroLevel;

import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.pojos.PrivateHome;
import io.mateu.mdd.shared.pojos.PublicHome;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class AppController extends Controller {

    private final boolean privada;
    private final App app;

    public AppController(boolean privada) {
        this.privada = privada;
        this.app = MDDUIAccessor.getApp();
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (app.isAuthenticationNeeded()) {
            return new PrivateHome();
        }

        if ("private".equals(step)) {
            return new PrivateHome();
        } else if ("public".equals(step)) {
            return new PublicHome();
        }

        return new PublicHome();
    }
}
