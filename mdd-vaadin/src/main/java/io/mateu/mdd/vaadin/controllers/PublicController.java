package io.mateu.mdd.vaadin.controllers;

import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MDDOpenHtml;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.navigation.ComponentWrapper;
import io.mateu.util.notification.Notifier;

public class PublicController extends Controller {

    @Override
    public Component apply(String path, String step, String remaining) throws Exception {

        App app = MDDUIAccessor.getApp();

        if ("".equals(step)) {
            // existe home?
            MenuEntry home = app.getDefaultPublicArea().getDefaultAction();
            if (home != null) {
                if (home instanceof MDDOpenHtml) {
                    return new ComponentWrapper(home.getIcon(), "Home", new Label(((MDDOpenHtml)home).html, ContentMode.HTML), false);
                } else {
                    try {
                        new AcctionRunner().run((AbstractAction) home);
                    } catch (Exception e) {
                        Notifier.alert(e);
                    }
                }
            } else {
                // si no, seguir hacia el área por defecto
                step += app.getDefaultPublicArea().getName();
            }
        }

        // si ya no es "/", entonces localizar el área y seguir
        AbstractArea area = (AbstractArea) app.getArea(path + "/" + step);
        Controller controller = area != null?new AreaController(area):new BrokenLinkController();

        return controller.next(path, step, remaining);
    }
}
