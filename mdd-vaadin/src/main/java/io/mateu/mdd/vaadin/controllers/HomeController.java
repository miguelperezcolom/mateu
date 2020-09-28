package io.mateu.mdd.vaadin.controllers;

import com.vaadin.navigator.View;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.shared.ui.MDDUIAccessor;

public class HomeController extends Controller {

    @Override
    public View apply(String s) {

        if (!s.startsWith("/")) s = "/" + s;

        if ("/".equals(s)) {
            if (MDDUIAccessor.getCurrentUser() != null) s = "/private";
            else s = "/public";
        }

        Controller controller = null;
        if (s.startsWith("/private")) {
            controller = new PrivateController();
            s = s.substring("/private".length());
        } else if (s.startsWith("/public")) {
            controller = new PublicController();
            s = s.substring("/public".length());
        } else {
            controller = new BrokenLinkController();
        }

        return controller.apply(s);
    }
}
