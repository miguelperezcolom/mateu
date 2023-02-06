package io.mateu.mdd.vaadin.controllers.firstLevel;

import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class PublicController extends Controller {

    public PublicController() {
    }


    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {

        if (MateuUI.get() != null) MateuUI.get().getMain().refreshHeader(false);

        App app = MDDUIAccessor.getApp();

        app.updateSession();

        if (!"".equals(step)) {
            // si ya no es "/", entonces localizar el área y seguir
            return app.getArea(path + "/" + step);
        }
        return null;
    }
}
