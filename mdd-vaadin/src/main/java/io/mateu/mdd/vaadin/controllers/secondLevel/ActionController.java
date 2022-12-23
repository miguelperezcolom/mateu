package io.mateu.mdd.vaadin.controllers.secondLevel;

import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class ActionController extends Controller {

    public ActionController() {
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (!"".equals(step)) {
            App app = MDDUIAccessor.getApp();

            return app.getMenu(path + "/" + cleanStep);

        }
        return null;
    }
}
