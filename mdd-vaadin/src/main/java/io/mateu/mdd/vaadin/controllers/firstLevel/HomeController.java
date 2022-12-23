package io.mateu.mdd.vaadin.controllers.firstLevel;

import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.pojos.PrivateHome;
import io.mateu.mdd.shared.pojos.PublicHome;
import io.mateu.mdd.vaadin.controllers.BrokenLinkController;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.util.notification.Notifier;

public class HomeController extends Controller {

    private final boolean privada;

    public HomeController(ViewStack stack, boolean privada) {
        this.privada = privada;
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (!"".equals(step)) {
            if ("private".equals(step)) {
                return new PrivateHome();
            } else if ("public".equals(step)) {
                return new PublicHome();
            }
        }
        return null;
    }
}
