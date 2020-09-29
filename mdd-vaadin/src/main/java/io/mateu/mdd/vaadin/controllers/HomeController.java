package io.mateu.mdd.vaadin.controllers;

import com.vaadin.navigator.View;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.ui.MDDUIAccessor;

public class HomeController extends Controller {

    @Override
    public Component apply(String path, String step, String remaining) throws Exception {

        if ("".equals(step)) {
            if (MDDUIAccessor.getCurrentUser() != null) step = "private";
            else step = "public";
        }

        Controller controller = null;
        if (step.equals("private")) {
            controller = new PrivateController();
        } else if (step.equals("public")) {
            controller = new PublicController();
        } else {
            controller = new BrokenLinkController();
        }

        return controller.next(path, step, remaining);
    }
}
